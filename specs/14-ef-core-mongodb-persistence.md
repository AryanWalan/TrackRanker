# EF Core MongoDB persistence

## Requirement addressed

This milestone satisfies the assessment's Entity Framework Core basic requirement while retaining TrackRanker's selected MongoDB NoSQL database. The production API targets .NET 10 and uses Entity Framework Core 10 through the official MongoDB EF Core provider for normal training-session and session-completion CRUD.

## Prior state and compliance audit

Before this milestone, `MongoDB.Driver` 3.10.0 supplied all persistence. There was no `DbContext`, and both concrete repositories queried `IMongoCollection<T>` directly. Data used the `trainingSessions` and `sessionCompletions` collections. Public IDs were strings represented as BSON ObjectIds; enums were stored as strings; dates were stored as UTC BSON dates; repetition results were an embedded array; and reflection was an embedded document.

`MongoSessionCompletionRepository` lazily created the unique `TrainingSessionId` index from repository calls. Completion insertion and the parent-session status update were two sequential writes with no cross-collection transaction.

## Packages and architecture

- .NET target: `net10.0`
- Entity Framework Core: 10.0.10
- Official MongoDB EF Core Provider: 10.0.2
- MongoDB .NET Driver: 3.10.0

The normal persistence flow is:

```text
Controller -> Service -> Repository -> TrackRankerDbContext
           -> official MongoDB EF Core Provider -> MongoDB
```

`TrackRankerDbContext` is scoped through dependency injection and exposes `DbSet<TrainingSession>` and `DbSet<SessionCompletion>`. Controllers remain thin, services retain validation and DTO mapping, and API responses do not expose tracked EF entities.

## Entity and collection compatibility

Focused EF configurations map the root entities to the existing collection names exactly:

- `TrainingSession` -> `trainingSessions`
- `SessionCompletion` -> `sessionCompletions`

The existing BSON attributes remain authoritative for compatibility. IDs and `TrainingSessionId` continue to be application strings encoded as BSON ObjectIds. Session type and status remain BSON strings. Existing field names and UTC date representations are unchanged.

`RepetitionResults` is mapped as an owned collection and remains an embedded BSON array of documents. `Reflection` is mapped as an owned object and remains an embedded BSON document. MongoDB foreign keys are not introduced; the service continues to validate that a parent training session exists.

No collections are renamed or dropped, no records are transformed, and no destructive migration is used. Read-only verification confirmed the pre-existing two sessions and one completion loaded through the EF-backed API, with no parallel collections created.

## Repository migration

`EfTrainingSessionRepository` now performs list, ID lookup, create, update, delete, and completion-driven status updates through `TrackRankerDbContext`. `EfSessionCompletionRepository` performs list, training-session lookup, create, update, and delete through the same scoped context type. Read queries use `AsNoTracking`; updates load a tracked entity and copy permitted values before `SaveChangesAsync`.

The obsolete direct-driver CRUD repositories were removed. Confidence History and Progress still read the same repository interfaces, so their calculations and response contracts are unchanged.

Malformed route IDs are rejected by controllers as HTTP 400 and are also safely treated as missing by repositories. Services continue generating new ObjectIds rather than trusting client-supplied IDs. Updates preserve `CreatedAtUtc` and advance `UpdatedAtUtc`.

## Unique completion constraint and retained driver use

The provider does not replace every MongoDB administrative operation. `SessionCompletionIndexInitializer` is a startup hosted service using the official driver solely to create the database-level unique index safely and idempotently:

```text
ux_sessionCompletions_trainingSessionId
TrainingSessionId ascending
unique: true
```

This work occurs once at application startup, not per request. Repository CRUD does not use `IMongoCollection<T>`. Expected duplicate-key provider exceptions are translated into the repository's conflict result, preserving HTTP 409 even when concurrent application-level checks race.

The pre-existing guarded `E2eDataResetService` also retains direct-driver `DeleteMany` calls as test-only database administration because the MongoDB EF provider does not offer a supported bulk-delete equivalent. It is unavailable in Production and restricted to explicitly enabled databases ending in `_e2e`.

## Transactions and standalone MongoDB

`MongoDb__UseTransactions` controls EF Core's `Database.AutoTransactionBehavior`:

- `true` (the options default) uses `WhenNeeded` for transaction-capable production deployments.
- `false` uses `Never` and is the safe Development default for a standalone local MongoDB service.

MongoDB keeps each individual document write atomic. With transactions disabled, completion creation and the parent session's status update remain separate `SaveChangesAsync` calls and are not cross-collection atomic. This intentionally preserves the existing documented trade-off and avoids standalone-server transaction failures. Production operators should provide a replica set or managed MongoDB deployment before enabling transactions. Even when enabled, the current two-save workflow is sequential rather than one cross-collection transaction; operational recovery for a rare second-write failure remains a known risk.

## Provider limitations

- Relational EF migrations are not supported or used. MongoDB has no relational schema migration step.
- Relational foreign keys and cascade assumptions are not used.
- Queries are restricted to provider-supported filtering, ordering, entity materialisation, and CRUD operations; DTO projection remains in services.
- Administrative index creation and guarded E2E bulk cleanup remain narrow driver operations.
- Standalone MongoDB cannot provide cross-document transactions.

## Testing and verification

Context metadata tests verify both DbSets, exact collection mappings, keys, and required fields. Deterministic repository tests use EF Core's in-memory provider to cover newest-first listing, valid/missing/malformed lookup, and session/completion create, update, and delete behaviour without requiring live infrastructure. Existing service and API tests continue covering duplicate conflict mapping, parent completion status, Confidence History, TrackRank XP, achievements, and endpoints.

Live verification used the isolated `trackranker_ef_verification` database. It covered session create/get/list/update, completion creation, parent status, Confidence History, Progress, restart persistence, completion update with stable `CreatedAtUtc`, completion-only deletion, parent retention, session deletion, and final empty collections. A read-only pass against `trackranker` confirmed existing data compatibility and the absence of duplicate collections.

## Deployment implications

MongoDB remains required. Deployments provide `MongoDb__ConnectionString`, `MongoDb__DatabaseName`, and an intentional `MongoDb__UseTransactions` value. Credentials remain outside the repository. No relational database or migration runner is needed. The API host must be able to create or verify the completion unique index at startup.

Normal application CRUD is performed through Entity Framework Core and the official MongoDB EF Core provider.
