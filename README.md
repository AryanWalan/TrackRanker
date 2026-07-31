# TrackRanker

**Understand your training. Trust your progress.**

TrackRanker is a gamified training-clarity and confidence application for competitive 100m, 200m, and 400m sprinters. It supports the coach-athlete relationship by helping athletes log prescribed training, understand its purpose, reflect on completed sessions, and build confidence from their own training evidence.

## Target users

Competitive sprint athletes working with a coach, initially focused on the 100m, 200m, and 400m.

## Current milestone

TrackRanker's Dashboard now gives first-time athletes a concise explanation of the product, its three-step workflow, and a clear first action. Training history is distinguished from logging a new session, the unused Profile navigation has been removed, and Confidence History presents previous reflections as readable evidence.

TrackRanker also includes process-based XP, personal TrackRank levels, and six achievements derived from stored session completions. After a completion is saved, athletes receive immediate feedback for backend-derived XP, rank, and newly unlocked achievement changes. The Progress page makes the rules and process totals transparent, while the Dashboard keeps TrackRank and recent training after its core workflow guidance.

Streamlined planned-session entry includes a Repeat session action and a Zustand-persisted unfinished draft. Session-list and Confidence filters also persist across navigation and refresh without storing server responses in client state. Completed-session reflection and evidence-based Confidence History remain available. Authentication, athlete profiles, leaderboards, athlete comparison, advanced analytics, and AI-generated encouragement are not implemented.

## TrackRank gamification

TrackRank measures engagement with the athlete's training process, not sprint ability. A stored session completion earns 20 XP, a meaningful reflection adds 10 XP, and paired confidence-before and confidence-after ratings add 5 XP. Every 100 XP increases TrackRank by one. XP, ranks, and achievements are always recalculated from current completion evidence rather than stored as mutable balances.

TrackRanker does not award XP for faster times, higher intensity, additional volume, personal bests, or extra training. There is no leaderboard.

## Technology stack

- Frontend: React, TypeScript, Vite, React Router, Zustand, Vitest, React Testing Library
- Backend: C# 14, .NET 10 Web API controllers, OpenAPI, Scalar, xUnit
- Database: MongoDB with the official MongoDB .NET driver
- Local infrastructure: Docker Compose

## Repository structure

```text
backend/
  TrackRanker.Api/
    Controllers/
    DTOs/
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
- Docker Desktop or another Docker Compose-compatible runtime

## MongoDB setup

Start the local MongoDB service from the repository root:

```bash
docker compose up -d mongodb
```

MongoDB is exposed at `mongodb://localhost:27017` and stores data in the named `trackranker-mongodb-data` volume. Stop it with `docker compose down`.

## Backend setup

```bash
cd backend
dotnet restore TrackRanker.slnx
dotnet run --project TrackRanker.Api
```

The development API runs at `http://localhost:5000` by default. Its health endpoint is `http://localhost:5000/api/health`, training sessions are available under `http://localhost:5000/api/training-sessions`, a session's completed outcome is available under `/api/training-sessions/{sessionId}/completion`, confidence evidence is available at `/api/confidence/history`, and derived gamification progress is available at `/api/progress`.

Scalar API documentation is available in development at `http://localhost:5000/scalar/v1`.

To use environment variables instead of the safe development defaults, copy `backend/.env.example` into the configuration mechanism used by your shell or development environment. The application does not automatically load `.env` files.

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

Backend service tests use fake repositories, and frontend tests mock API calls. Neither automated suite requires a live MongoDB instance. Tests cover session workflows, confidence history, and deterministic progress calculations including XP, TrackRank boundaries, and achievements.

## Environment variables

| Variable | Development default | Purpose |
| --- | --- | --- |
| `MongoDb__ConnectionString` | `mongodb://localhost:27017` | MongoDB server connection |
| `MongoDb__DatabaseName` | `trackranker` | MongoDB database name |
| `Frontend__AllowedOrigin` | `http://localhost:5173` | Allowed development CORS origin |
| `VITE_API_BASE_URL` | `http://localhost:5000` | Frontend API base URL |

Production deployments must provide all backend values explicitly; no credentials are committed.

## Advanced Requirements Selected

1. **Security Measures**
   - Data validation and sanitisation: implemented at existing API and service boundaries; broader security work remains partial.
   - Rate limiting: planned.
   - Status: **partially implemented**.
2. **Zustand State Management**
   - Persists unfinished new-session drafts plus Sessions and Confidence filter preferences while keeping API data out of the store.
   - Status: **implemented**.
3. **Cypress End-to-End Testing**
   - Browser-level end-to-end coverage is reserved for a future milestone.
   - Status: **planned**.

## Initial deployment plan

The planned production shape is a statically hosted frontend, a separately deployed .NET API, and a managed MongoDB service. Deployment providers and production URLs will be selected in a later milestone.

This repository is being developed through incremental commits, with each milestone kept reviewable and tested.

## Assessment gamification theme

TrackRank satisfies the gamification theme through transparent, process-based XP, personal levels, progress indicators, and achievements. It deliberately avoids leaderboards and performance rewards so gamification supports prescribed training and reflection rather than excessive work or athlete comparison.

## AI usage

AI-assisted development evidence and prompts are retained under `specs/prompts/`. A fuller usage statement will be added as the project develops.

## Self-reflection

Project self-reflection will be documented in a future milestone.
