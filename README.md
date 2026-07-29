# TrackRanker

**Understand your training. Trust your progress.**

TrackRanker is a gamified training-clarity and confidence application for competitive 100m, 200m, and 400m sprinters. It is designed to support the coach-athlete relationship by helping athletes understand, record, and reflect on prescribed training.

## Target users

Competitive sprint athletes working with a coach, initially focused on the 100m, 200m, and 400m.

## Current milestone

Milestone 1 provides a runnable, tested full-stack scaffold: a React application shell, a .NET health API, MongoDB dependency injection, local database infrastructure, and project documentation. Training features, profiles, authentication, confidence tracking, and gamification are not implemented yet.

## Technology stack

- Frontend: React, TypeScript, Vite, React Router, Vitest, React Testing Library
- Backend: C# 14, .NET 10 Web API controllers, OpenAPI, Scalar, xUnit
- Database: MongoDB with the official MongoDB .NET driver
- Local infrastructure: Docker Compose

## Repository structure

```text
backend/
  TrackRanker.Api/
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

The development API runs at `http://localhost:5000` by default. Its health endpoint is `http://localhost:5000/api/health`.

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

Frontend tests mock backend calls and do not require a running API.

## Environment variables

| Variable | Development default | Purpose |
| --- | --- | --- |
| `MongoDb__ConnectionString` | `mongodb://localhost:27017` | MongoDB server connection |
| `MongoDb__DatabaseName` | `trackranker` | MongoDB database name |
| `Frontend__AllowedOrigin` | `http://localhost:5173` | Allowed development CORS origin |
| `VITE_API_BASE_URL` | `http://localhost:5000` | Frontend API base URL |

Production deployments must provide all backend values explicitly; no credentials are committed.

## Initial deployment plan

The planned production shape is a statically hosted frontend, a separately deployed .NET API, and a managed MongoDB service. Deployment providers and production URLs will be selected in a later milestone.

This repository is being developed through incremental commits, with each milestone kept reviewable and tested.

## Assessed advanced requirements

To be selected and documented in a future milestone:

1. Advanced requirement one — pending.
2. Advanced requirement two — pending.
3. Advanced requirement three — pending.

## AI usage

AI-assisted development evidence and prompts are retained under `specs/prompts/`. A fuller usage statement will be added as the project develops.

## Self-reflection

Project self-reflection will be documented in a future milestone.
