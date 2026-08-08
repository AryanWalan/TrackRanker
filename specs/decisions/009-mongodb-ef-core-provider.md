# Decision 009: Use the official MongoDB EF Core provider

## Status

Accepted.

## Context

TrackRanker selected MongoDB for its document-oriented training, repetition, and reflection data. The assessment also explicitly requires Entity Framework Core. Before this decision, ordinary persistence used only the MongoDB .NET Driver; merely adding an unused EF package would not satisfy the requirement or improve the application's actual persistence path.

Existing development data must remain available. Its BSON ObjectIds, string-valued enums, embedded repetition/reflection documents, exact collection names, and unique completion index form a compatibility boundary.

## Decision

Use Entity Framework Core 10 and the official MongoDB EF Core Provider 10 for all normal application CRUD while retaining MongoDB as the NoSQL database.

Repositories depend on a scoped `TrackRankerDbContext`, which maps `TrainingSession` to `trainingSessions` and `SessionCompletion` to `sessionCompletions`. Existing BSON representation attributes remain in place. Services keep parent-existence validation and DTO mapping because MongoDB foreign keys are neither required nor appropriate.

EF relational migrations are not used because the MongoDB provider does not support or require relational schema migrations. A narrowly scoped hosted service retains the official MongoDB driver for idempotent unique-index administration. The guarded E2E reset service retains it for test-only bulk cleanup, which is not an application CRUD path.

Transaction behaviour is explicit. Transaction-capable deployments default to EF's `WhenNeeded` behaviour. Local Development sets `MongoDb__UseTransactions=false`, selecting `Never` so a standalone MongoDB Windows service can write successfully. Individual document writes remain atomic, but the sequential completion and parent-status writes are not cross-collection atomic.

## Alternatives considered

### Move to PostgreSQL or SQLite

Rejected. It would replace the selected NoSQL architecture, require a destructive or complex data migration, and flatten or remodel useful embedded evidence without a product need.

### Retain driver-only persistence

Rejected. The implementation worked, but it did not satisfy the assessment's explicit EF Core requirement.

### Add unused or parallel EF persistence

Rejected. Fake compliance would leave normal CRUD on the driver, introduce two competing data paths, and risk writing incompatible parallel collections.

## Consequences and mitigations

- Normal repository CRUD genuinely flows through `TrackRankerDbContext` and the official provider.
- MongoDB and existing documents are retained without a destructive migration.
- Provider-supported query shapes constrain repository implementation; DTO mapping stays outside queries.
- Direct-driver use is easy to audit because it is isolated to startup index administration and guarded E2E cleanup.
- The unique index remains the concurrency-safe source of truth for one completion per session, while expected duplicate-key failures map to HTTP 409.
- Local standalone development works without transactions. The known risk of a completion succeeding before its parent status update is mitigated by documenting the trade-off and keeping the two writes explicit. A future reliability milestone may introduce an atomic unit-of-work path for replica-set deployments without changing the API.
- Package/provider upgrades require compatibility and live BSON-shape regression checks.
