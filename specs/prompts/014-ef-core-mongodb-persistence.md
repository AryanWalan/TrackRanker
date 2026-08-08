You are implementing a critical backend compliance milestone for TrackRanker.

Milestone: Migrate MongoDB application persistence to the official MongoDB
Entity Framework Core provider while preserving the existing API, data and behaviour.

IMPORTANT:
- Do NOT run git add.
- Do NOT create a git commit.
- Do NOT push.
- I will stage and commit manually.
- Do not make unrelated frontend or product changes.
- Do not merely install EF Core without using it.
- TrackRanker's actual training-session and completion persistence must use EF Core.
- Preserve existing MongoDB data wherever technically possible.

Before making changes:

1. Read AGENTS.md.
2. Read README.md.
3. Read all current architecture, database, session and completion specifications.
4. Inspect the backend solution and package references.
5. Inspect:
   - Program.cs
   - MongoDB settings/configuration
   - TrainingSession model
   - SessionCompletion model
   - nested repetition/reflection models
   - repository interfaces
   - MongoDB repository implementations
   - services
   - controllers
   - existing unique-index setup
   - backend tests
6. Determine whether Entity Framework Core is currently genuinely used.
7. Preserve all previous specs/prompts files unchanged.
8. Before changing persistence, inspect the current MongoDB collection names and
   document field mappings so existing development data is not accidentally abandoned.

# Assessment requirement

The assessment requires:

- C# with .NET 10 or higher
- Entity Framework Core
- SQL or NoSQL persistence
- CRUD
- backend tests
- deployment
- Scalar

TrackRanker uses MongoDB and should remain a NoSQL application.

The goal is to satisfy the EF Core requirement through the official MongoDB EF Core
provider rather than changing the project to a relational database.

# Required technology

Use versions compatible with:

- .NET 10
- Entity Framework Core 10
- MongoDB EF Core Provider 10

Expected package:

MongoDB.EntityFrameworkCore

Use the current stable 10.x package compatible with the installed .NET 10 SDK.

Add Microsoft.EntityFrameworkCore explicitly only when required by the provider/project.

Do not install an unofficial MongoDB EF provider.

Do not change the target framework away from .NET 10.

# Phase 1: compliance audit

Before implementing, briefly record the existing state:

- Current database access package(s)
- Whether a DbContext exists
- Whether repositories use EF Core
- Existing MongoDB collections
- Existing identifier representation
- Existing nested-document representation
- Existing index behaviour
- Existing transaction behaviour

If EF Core is already genuinely responsible for application persistence, do not
perform an unnecessary migration. Instead verify and document it thoroughly.

However, an installed-but-unused EF Core package does NOT count as genuine usage.

# Main architecture goal

The resulting flow should be:

Controller
→ Service
→ Repository
→ TrackRankerDbContext
→ MongoDB EF Core Provider
→ MongoDB

Keep:

- thin controllers
- existing services
- repository interfaces
- DTO separation
- async operations
- server-side validation
- existing REST endpoints

Do not expose EF entities directly from API responses.

# DbContext

Create a focused context, for example:

TrackRankerDbContext

It should expose DbSet properties for:

- TrainingSession
- SessionCompletion

Use appropriate actual model names.

Register the context through dependency injection.

Configure it with:

- MongoDB connection string
- MongoDB database name
- official UseMongoDB provider configuration

Continue using environment-based configuration:

MongoDb__ConnectionString
MongoDb__DatabaseName

Do not commit credentials.

# Collection compatibility

Preserve the current collection names exactly:

trainingSessions
sessionCompletions

Do not silently start writing to newly named collections.

Use EF model configuration to map entities to these existing collections.

Preserve existing document field names and BSON-compatible representation where
necessary.

Do not drop collections.

Do not rename collections.

Do not delete existing records.

Do not implement a destructive one-time migration.

# Existing data compatibility

Existing local TrackRanker data should remain readable after this change.

Before implementation:

- inspect representative current documents where the environment allows
- record the shape without exposing private data in documentation
- identify how IDs and nested objects are stored

After implementation:

- verify the same existing sessions and completions load through EF Core
- verify no duplicate parallel collections were created
- verify old records can be edited and deleted
- verify new records can be read after restart

If complete compatibility cannot be achieved without transforming existing data:

- stop before destructive changes
- clearly report the incompatibility
- do not silently erase or abandon data

# Entity identifiers

Preserve existing API ID behaviour.

Malformed MongoDB IDs must still produce HTTP 400 rather than HTTP 500.

Existing IDs must continue working in routes.

Choose the EF entity ID representation that best preserves existing documents:

- ObjectId
or
- string represented as MongoDB ObjectId

Do not change public API IDs unnecessarily.

Do not trust client-supplied IDs for new records.

# Model configuration

Use fluent EF model configuration or focused entity configuration classes.

Map:

TrainingSession:
- collection
- key
- required fields
- optional clarity fields
- timestamps
- controlled type/status values

SessionCompletion:
- collection
- key
- TrainingSessionId
- ratings
- timestamps
- repetition results
- structured reflection
- confidence values

Preserve nested MongoDB document structure for:

- RepetitionResults
- Reflection

Use owned/complex mapping only where supported by the current MongoDB EF provider.

Do not force relational concepts such as foreign keys into MongoDB.

The application must continue validating parent-session existence through the
service/repository design.

# Query compatibility

Use supported EF Core operations.

Prefer:

- AsNoTracking()
- Where(...)
- FirstOrDefaultAsync(...)
- SingleOrDefaultAsync(...) where safe
- ToListAsync(...)
- Add(...)
- Remove(...)
- SaveChangesAsync(...)

Be aware that some relational EF behaviours are not available with MongoDB.

Do not introduce unsupported relational assumptions.

Do not use EF migrations because the MongoDB EF provider does not support relational
schema migrations.

Do not use unsupported Select projections if the installed provider does not support
them.

Where necessary:

1. Load the entity through a supported query.
2. Map it to DTOs in the existing service/mapping layer.

# Repository migration

Refactor the concrete repositories so normal application CRUD uses TrackRankerDbContext.

Training-session repository operations must use EF Core for:

- list
- get by ID
- create
- update
- delete
- status update

Session-completion repository operations must use EF Core for:

- get by training-session ID
- list when required by Confidence/Progress
- create
- update
- delete

Do not keep the existing direct-driver CRUD implementation active behind the same
repository interfaces.

Remove obsolete repository code only after all behaviour is reproduced and tested.

# Direct MongoDB driver usage

The official EF provider may not expose every MongoDB administrative capability.

A narrowly scoped direct-driver component may remain ONLY for genuinely unsupported
administrative tasks, such as ensuring a database-level unique index.

If retained:

- isolate it clearly in an index-initialisation/infrastructure class
- do not use it for ordinary application CRUD
- explain why it remains
- keep its scope minimal
- register it separately from repositories
- ensure the README can truthfully state that application persistence uses EF Core

Do not keep two competing CRUD paths.

# Unique completion constraint

TrackRanker currently allows only one SessionCompletion per TrainingSession.

Preserve the unique database index on:

TrainingSessionId

Preserve the index name if practical:

ux_sessionCompletions_trainingSessionId

Ensure index creation remains:

- safe
- idempotent
- not performed repeatedly per request

Continue translating duplicate completion attempts into HTTP 409 Conflict.

Do not rely solely on application-level checks because concurrent requests could race.

# Transactions and local MongoDB

The local MongoDB Windows service may be a standalone server rather than a replica set.

The MongoDB EF provider may use transactions during SaveChanges.

Inspect actual provider behaviour and current server capability.

Implement a deliberate configuration strategy rather than allowing local writes to
fail unexpectedly.

Possible configuration:

MongoDb__UseTransactions=false

for the local standalone development environment, while allowing transaction-capable
production MongoDB deployments to enable transactions.

If transactions are disabled:

- configure EF AutoTransactionBehavior deliberately
- document that individual MongoDB document writes remain atomic
- document that multi-document/multi-collection operations are not atomic
- preserve the existing documented completion/status trade-off
- do not claim cross-collection ACID behaviour

Do not weaken production behaviour silently.

Do not require Docker.

Local MongoDB is available through:

mongodb://127.0.0.1:27017

# Completion creation and parent status

Preserve the current behaviour:

Creating SessionCompletion
→ parent TrainingSession status becomes Completed

Use EF Core for both data changes.

Where technically safe, track both entities in the same DbContext and call
SaveChangesAsync in a clear, controlled manner.

Behaviour must remain:

- completion is created
- parent becomes Completed
- duplicate completion returns conflict
- deleting completion does not delete parent
- deleting completion does not revert parent status

Preserve CreatedAtUtc during updates.

Update UpdatedAtUtc appropriately.

# Confidence and Progress services

Do not change product calculations.

Confidence history must still:

- join completion evidence to sessions
- exclude meaningless records
- calculate nullable averages correctly
- return newest first

Progress must still derive:

- 20 XP per completion
- 10 XP per meaningful reflection
- 5 XP per paired confidence check-in
- TrackRank formula
- six existing achievements

Update repository methods only where required to support the same results through EF.

Do not store derived confidence or progress data.

# API compatibility

Do not change existing endpoint routes or response shapes.

Preserve:

GET /api/training-sessions
GET /api/training-sessions/{id}
POST /api/training-sessions
PUT /api/training-sessions/{id}
DELETE /api/training-sessions/{id}

GET /api/training-sessions/{sessionId}/completion
POST /api/training-sessions/{sessionId}/completion
PUT /api/training-sessions/{sessionId}/completion
DELETE /api/training-sessions/{sessionId}/completion

GET /api/confidence/history
GET /api/progress
GET /api/health

Scalar must continue documenting all public endpoints.

# Error handling

Preserve meaningful responses:

- 400 malformed ID/invalid input
- 404 missing session/completion
- 409 duplicate completion
- 201 successful creation
- 204 successful deletion

Do not expose EF, MongoDB, connection-string or stack-trace details in API responses.

Handle expected EF/provider exceptions deliberately.

Do not catch all exceptions and convert everything into HTTP 400.

# Dependency injection lifecycle

Use an appropriate scoped DbContext lifetime.

Repositories and services must have compatible lifetimes.

Do not register DbContext as a singleton.

Ensure index initialisation does not incorrectly capture scoped services.

Keep Program.cs understandable.

Move detailed EF model configuration into dedicated files where appropriate.

# Testing strategy

All existing backend tests must continue passing.

Update fakes/mocks only where required by repository-interface changes.

Do not weaken existing service/controller assertions.

Add tests covering at minimum:

1. TrackRankerDbContext exposes TrainingSessions.
2. TrackRankerDbContext exposes SessionCompletions.
3. Entities map to the existing collection names.
4. Required entity/key configuration is present.
5. Repository list remains newest-first.
6. Repository retrieval handles valid and missing IDs.
7. Training-session create/update/delete behaviour remains correct.
8. Completion create/update/delete behaviour remains correct.
9. Duplicate completion still maps to conflict.
10. Parent session becomes Completed after completion creation.
11. Confidence-history calculations remain unchanged.
12. Progress XP and achievements remain unchanged.
13. Existing API endpoint tests continue passing.

Normal unit tests should not require a live MongoDB server unless the repository already
has an established integration-test strategy.

# Integration verification

Because this milestone changes persistence, perform real local MongoDB verification.

Use a separate temporary database where practical, for example:

trackranker_ef_verification

Do not damage the normal development database.

Verify:

1. Start API using the EF verification database.
2. Create a session.
3. Retrieve it.
4. List it.
5. Update it.
6. Create a completion.
7. Confirm parent status becomes Completed.
8. Confirm Confidence history includes it.
9. Confirm Progress XP reflects it.
10. Restart API.
11. Confirm both records persist.
12. Update the existing completion.
13. Confirm CreatedAtUtc remains stable.
14. Delete only the completion.
15. Confirm parent session remains.
16. Delete the session.
17. Confirm the database is clean.

Then verify read compatibility against the normal development database without
modifying or deleting its existing records unnecessarily.

Confirm no unexpected duplicate collections were created.

# Frontend regression

No frontend feature changes are expected.

Do not redesign the UI.

Run frontend tests/build to confirm unchanged API compatibility.

Do not modify TypeScript contracts unless the backend response genuinely changed,
which should be avoided.

# Documentation

Create:

specs/14-ef-core-mongodb-persistence.md

Document:

- assessment requirement being addressed
- prior direct-driver architecture
- official MongoDB EF provider decision
- package versions
- DbContext architecture
- entity and collection mappings
- preservation of existing collections
- repository migration
- nested-document mapping
- identifier handling
- unique-index handling
- any narrow remaining direct-driver usage
- transaction configuration
- local standalone MongoDB considerations
- provider limitations
- testing strategy
- deployment implications
- explicit confirmation that normal CRUD uses EF Core

Create:

specs/decisions/009-mongodb-ef-core-provider.md

Document:

Context:
TrackRanker selected MongoDB as its NoSQL database, while the assessment explicitly
requires Entity Framework Core.

Decision:
Use the official MongoDB Entity Framework Core provider and retain MongoDB.

Explain:

- why MongoDB is retained
- why an unused EF package would be insufficient
- why application CRUD is migrated to DbContext
- why collection names/data compatibility matter
- why EF migrations are not used
- why direct-driver use, if any, is limited to unsupported administrative operations
- transaction trade-offs for local standalone MongoDB
- alternatives considered:
  - moving to PostgreSQL/SQLite
  - retaining driver-only persistence
  - fake/parallel EF usage
- risks and mitigations

# AI prompt evidence

Create:

specs/prompts/014-ef-core-mongodb-persistence.md

Copy this COMPLETE prompt into that file exactly.

Do not modify previous prompt evidence.

Verify all previous prompt files remain unchanged.

# README updates

Update README.md accurately.

Add or update:

Technology stack:
- Entity Framework Core 10
- official MongoDB EF Core Provider
- MongoDB

Backend architecture:
- DbContext
- repositories
- services
- controllers

Database setup:
- MongoDB remains required
- no relational EF migrations
- local transaction setting if applicable

Basic-requirements checklist:
Clearly state that EF Core is implemented through the official MongoDB provider.

Do not claim unsupported EF features.

Do not change the selected three advanced requirements.

This is a BASIC requirement compliance milestone, not a fourth advanced requirement.

# Environment examples

Update backend environment example files if necessary.

Document any new value such as:

MongoDb__UseTransactions=false

Use safe local defaults.

Do not commit actual secrets.

Do not remove existing production-ready environment-variable support.

# Verification commands

Run:

dotnet restore backend\TrackRanker.slnx

dotnet build backend\TrackRanker.slnx

dotnet test backend\TrackRanker.slnx --no-build

From frontend:

npm test
npm run build

Also run:

git diff --check
git status

Perform:

- secret scan
- generated-file scan
- prompt-integrity check
- package-reference review
- unused old repository review

Ensure these are not tracked:

node_modules
bin
obj
dist
coverage
temporary MongoDB dumps
connection-string files

Do NOT stage.
Do NOT commit.
Do NOT push.

# Manual Scalar verification

Run the backend and verify:

- /api/health works
- Scalar returns HTTP 200
- OpenAPI includes all existing endpoints
- representative CRUD requests work through Scalar or an HTTP client

# Success criteria

This milestone is successful only when:

1. TrackRanker genuinely uses EF Core for normal MongoDB CRUD.
2. Existing API behaviour is preserved.
3. Existing collections/data remain compatible.
4. Tests pass.
5. Live MongoDB CRUD and restart persistence pass.
6. Scalar still works.
7. Documentation accurately explains the architecture.
8. No destructive data operation occurred.

Do not claim success merely because EF Core packages compile.

# Out of scope

Do NOT implement:

- Cypress
- rate limiting
- new security features
- deployment
- authentication
- user accounts
- theme switching
- new frontend features
- new gamification
- relational database migration
- EF relational migrations
- Docker installation
- broad service/controller rewrites
- unrelated package upgrades
- React Router forced audit fixes

# Final response

When finished, report:

1. Initial compliance audit result.
2. EF Core/provider package versions.
3. DbContext architecture.
4. Entity and collection mappings.
5. Existing-data compatibility approach.
6. Repository changes.
7. Direct-driver code retained or removed.
8. Unique-index implementation.
9. Transaction configuration.
10. API compatibility.
11. Tests added or updated.
12. Exact build/test results.
13. Live MongoDB verification.
14. Restart-persistence verification.
15. Scalar verification.
16. Documentation changes.
17. Any provider limitations or unresolved risks.
18. Files created and modified.
19. git status summary.
20. Recommended next milestone.

IMPORTANT:

Do NOT stage changes.
Do NOT create a commit.
Do NOT push.
Do NOT report a commit hash.

I will review and commit manually.
