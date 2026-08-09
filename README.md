# TrackRanker

**Understand your training. Trust your progress.**

TrackRanker is a gamified training-clarity and confidence application for competitive 100m, 200m, and 400m sprinters. It supports the coach-athlete relationship by helping athletes log prescribed training, understand its purpose, reflect on completed sessions, and build confidence from their own training evidence.

## Target users

Competitive sprint athletes working with a coach, initially focused on the 100m, 200m, and 400m.

## Current milestone

TrackRanker's Dashboard now gives first-time athletes a concise, sectioned journey from the product introduction and three-step workflow through training actions, TrackRank progress, recent sessions, and secondary system status. Training History provides persistent quick filters, scan-friendly prescriptions, and clear actions for planned and completed sessions; the unused Profile navigation remains removed, and Confidence History presents previous reflections as readable evidence.

TrackRanker also includes process-based XP, personal TrackRank levels, and six achievements derived from stored session completions. After a completion is saved, athletes receive immediate feedback for backend-derived XP, rank, and newly unlocked achievement changes. The Progress page makes the rules and process totals transparent, while the Dashboard keeps TrackRank and recent training after its core workflow guidance.

Backend persistence now satisfies the assessment's Entity Framework Core basic requirement through the official MongoDB EF Core provider. MongoDB remains the NoSQL database, existing collections and BSON document shapes are retained, and normal repository CRUD flows through `TrackRankerDbContext`.

Streamlined planned-session entry includes a Repeat session action and a Zustand-persisted unfinished draft. Session-list and Confidence filters also persist across navigation and refresh without storing server responses in client state. Completed-session reflection and evidence-based Confidence History remain available. Authentication, athlete profiles, leaderboards, athlete comparison, advanced analytics, and AI-generated encouragement are not implemented.

## TrackRank gamification

TrackRank measures engagement with the athlete's training process, not sprint ability. A stored session completion earns 20 XP, a meaningful reflection adds 10 XP, and paired confidence-before and confidence-after ratings add 5 XP. Every 100 XP increases TrackRank by one. XP, ranks, and achievements are always recalculated from current completion evidence rather than stored as mutable balances.

TrackRanker does not award XP for faster times, higher intensity, additional volume, personal bests, or extra training. There is no leaderboard.

## Technology stack

- Frontend: React, TypeScript, Vite, React Router, Zustand, Vitest, React Testing Library
- Backend: C# 14, .NET 10, Entity Framework Core 10, Web API controllers, OpenAPI, Scalar, xUnit
- Database: MongoDB with the official MongoDB EF Core Provider 10; the MongoDB .NET Driver is retained only for narrow administrative operations
- Local infrastructure: MongoDB Windows service or Docker Compose

## Repository structure

```text
backend/
  TrackRanker.Api/
    Controllers/
    Data/
    DTOs/
    Infrastructure/
    Models/
    Repositories/
    Services/
  TrackRanker.Api.Tests/
  TrackRanker.slnx
frontend/
specs/
  decisions/
  prompts/
AGENTS.md
docker-compose.yml
```

## Prerequisites

- .NET SDK 10
- Node.js 20.19+ or 22.12+
- npm
- A MongoDB service; Docker Desktop is optional

## MongoDB setup

Start the local MongoDB service from the repository root:

```bash
docker compose up -d mongodb
```

MongoDB is exposed at `mongodb://localhost:27017` and stores data in the named `trackranker-mongodb-data` volume. Stop it with `docker compose down`.

On Windows, a locally installed MongoDB service listening on `mongodb://127.0.0.1:27017` can be used instead. Docker is not required for local development or E2E testing when that service is available.

TrackRanker does not use relational EF migrations. `TrackRankerDbContext` maps directly to the existing `trainingSessions` and `sessionCompletions` MongoDB collections. Startup idempotently ensures the unique completion index through a narrowly scoped driver-based administrative component.

## Backend setup

```bash
cd backend
dotnet restore TrackRanker.slnx
dotnet run --project TrackRanker.Api
```

The development API runs at `http://localhost:5000` by default. Its health endpoint is `http://localhost:5000/api/health`, training sessions are available under `http://localhost:5000/api/training-sessions`, a session's completed outcome is available under `/api/training-sessions/{sessionId}/completion`, confidence evidence is available at `/api/confidence/history`, and derived gamification progress is available at `/api/progress`.

Scalar API documentation is available in development at `http://localhost:5000/scalar/v1`.

To use environment variables instead of the safe development defaults, copy `backend/.env.example` into the configuration mechanism used by your shell or development environment. The application does not automatically load `.env` files. Local Development sets `MongoDb__UseTransactions=false` for standalone MongoDB. Transaction-capable replica-set or managed deployments can set it to `true`; disabling transactions means the completion and parent-status writes are sequential rather than cross-collection atomic.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` by default. Copy `frontend/.env.example` to `frontend/.env.local` only when a different API URL is needed.

## Tests and builds

```bash
dotnet test backend/TrackRanker.slnx
dotnet build backend/TrackRanker.slnx --no-restore

cd frontend
npm test
npm run build
```

Backend service tests use fake repositories, repository tests use EF Core's deterministic in-memory provider, and frontend tests mock API calls. Neither automated suite requires a live MongoDB instance. Tests cover EF mappings and repository CRUD, session workflows, confidence history, and deterministic progress calculations including XP, TrackRank boundaries, and achievements.

The testing layers have distinct responsibilities:

- xUnit verifies backend services and API boundaries in isolation.
- Vitest and React Testing Library verify frontend components and interactions.
- Cypress verifies a small set of critical workflows across the real browser, React app, .NET API, and MongoDB.

### Cypress end-to-end tests

Cypress requires Node.js, .NET 10, and a MongoDB service at `mongodb://127.0.0.1:27017`. It uses the dedicated `trackranker_e2e` database and must never be run against the normal `trackranker` database. Docker is not required.

Start the services in three PowerShell terminals from the repository:

Terminal 1:

```powershell
$env:MongoDb__ConnectionString = "mongodb://127.0.0.1:27017"
$env:MongoDb__DatabaseName = "trackranker_e2e"
$env:E2E__Enabled = "true"
$env:Frontend__AllowedOrigin = "http://localhost:5173"
dotnet run --project backend\TrackRanker.Api
```

Terminal 2:

```powershell
cd frontend
npm run dev
```

Terminal 3:

```powershell
cd frontend
npm run cy:run
```

Use `npm run cy:open` for the interactive runner or `npm run test:e2e` as an alias for the headless suite. The local frontend defaults to `http://localhost:5173` and the E2E API defaults to `http://localhost:5000`; CI or another environment can override these with `CYPRESS_BASE_URL` and `CYPRESS_API_URL`.

Each scenario calls the guarded `POST /api/testing/reset` endpoint and clears only TrackRanker's persisted browser workspace state. The endpoint returns 404 unless `E2E__Enabled=true`, remains unavailable in Production even if that flag is set, accepts no database name, and the API refuses to start in non-production E2E mode unless the configured database name ends in `_e2e`.

## Environment variables

| Variable | Development default | Purpose |
| --- | --- | --- |
| `MongoDb__ConnectionString` | `mongodb://localhost:27017` | MongoDB server connection |
| `MongoDb__DatabaseName` | `trackranker` | MongoDB database name |
| `MongoDb__UseTransactions` | `false` | Disables EF automatic transactions for local standalone MongoDB; use `true` only with a transaction-capable deployment |
| `E2E__Enabled` | `false` | Enables the guarded E2E reset route; only valid with an `_e2e` database |
| `Frontend__AllowedOrigin` | `http://localhost:5173` | Allowed development CORS origin |
| `RateLimiting__ApiPermitLimit` | `120` | Maximum public API requests per client/IP in each window |
| `RateLimiting__WritePermitLimit` | `30` | Maximum session/completion writes per client/IP in each window |
| `RateLimiting__WindowSeconds` | `60` | Fixed rate-limit window length |
| `VITE_API_BASE_URL` | `http://localhost:5000` | Frontend API base URL |

Production deployments must provide all backend values explicitly; no credentials are committed.

## Basic requirements compliance

Entity Framework Core is implemented as the real application persistence layer through the official MongoDB EF Core provider. Scoped repositories use `TrackRankerDbContext` for normal CRUD while MongoDB remains the NoSQL database. Direct driver access is isolated to unsupported administrative work: unique-index creation and the guarded E2E bulk reset. This is a basic-requirement compliance milestone, not an additional advanced requirement.

## Advanced Requirements Selected

1. **Security Measures**
   - **Data validation / sanitisation:** API DTOs and services enforce required values, controlled enums, ranges, and maximum lengths. Required text cannot become empty after trimming, while whitespace-only optional fields become `null`. This protects the integrity of athlete-entered evidence without damaging valid notation such as `3 × 150m`, percentages, dashes, or punctuation.
   - **Rate limiting:** ASP.NET Core's built-in fixed-window middleware allows 120 normal API requests and 30 writes per minute per client/IP. Session and completion writes use the stricter policy; excessive traffic receives HTTP 429 with safe, understandable wording. This limits automated resource consumption and repeated public writes while TrackRanker has no accounts.
   - Status: **implemented**.
2. **Zustand State Management**
   - Persists unfinished new-session drafts plus Sessions and Confidence filter preferences while keeping API data out of the store.
   - Status: **implemented**.
3. **Cypress End-to-End Testing**
   - Verifies onboarding and navigation, session creation, completion and reflection, confidence evidence, TrackRank progress, and Repeat Session through real browser → frontend → API → MongoDB workflows. Repeated full-suite runs use the dedicated `trackranker_e2e` database, and automated data reset is available only through the guarded E2E mode.
   - Status: **implemented**.

### Dependency security note

Dependency auditing is maintained separately and is not counted as one of the two selected Security Measures. The current `npm audit` reports one high-severity transitive finding in `nanoid` 3.3.16 through Vite's PostCSS build-tooling path. TrackRanker does not call the affected custom-generator API directly, and a patched transitive version is available. This focused milestone does not apply a forced or unrelated dependency upgrade; the finding remains recorded for the final dependency-maintenance review.

## Initial deployment plan

The planned production shape is a statically hosted frontend, a separately deployed .NET API, and a managed MongoDB service. Deployment providers and production URLs will be selected in a later milestone.

This repository is being developed through incremental commits, with each milestone kept reviewable and tested.

## Assessment gamification theme

TrackRank satisfies the gamification theme through transparent, process-based XP, personal levels, progress indicators, and achievements. It deliberately avoids leaderboards and performance rewards so gamification supports prescribed training and reflection rather than excessive work or athlete comparison.

## AI usage

AI-assisted development evidence and prompts are retained under `specs/prompts/`. A fuller usage statement will be added as the project develops.

## Self-reflection

Project self-reflection will be documented in a future milestone.
