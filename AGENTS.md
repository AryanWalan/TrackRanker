# TrackRanker contributor instructions

## Purpose

TrackRanker helps competitive 100m, 200m, and 400m sprinters understand prescribed training, reflect on progress, and build confidence while supporting the coach-athlete relationship. It must not undermine coaches, diagnose medical conditions, or encourage training through injury.

## Required stack

- Frontend: React, TypeScript, Vite, React Router, CSS, Vitest, React Testing Library
- Backend: C#, .NET 10 Web API controllers, OpenAPI, Scalar, xUnit
- Database: MongoDB using the official MongoDB .NET driver
- Repository: one Git repository for code, tests, documentation, and specifications

## Structure

- `backend/TrackRanker.Api`: production API
- `backend/TrackRanker.Api.Tests`: backend tests
- `frontend`: React application and frontend tests
- `specs`: product, architecture, decisions, and retained prompt evidence

## Commands

Frontend:

```bash
cd frontend
npm install
npm run dev
npm test
npm run build
```

Backend:

```bash
dotnet restore backend/TrackRanker.slnx
dotnet run --project backend/TrackRanker.Api
dotnet test backend/TrackRanker.slnx
dotnet build backend/TrackRanker.slnx --no-restore
```

## Conventions and scope

- Implement only the requested milestone. Do not add future features speculatively.
- Do not make unrelated architectural changes.
- Keep files focused and names explicit; enable nullable reference types and use async APIs for I/O.
- Keep controllers thin and place business logic in services.
- In future APIs, use DTOs instead of directly exposing database models.
- Use semantic, accessible HTML with visible focus states and responsive layouts.
- Update `/specs` whenever product or architecture decisions change.
- Never delete previous AI prompt evidence.

## Testing

- Add or update automated tests for changed behaviour.
- Tests must be deterministic and must not require live external services unless explicitly integration-scoped.
- Run the relevant restore, build, and test commands before committing.
- Report every test and build command run, including failures and warnings.

## Security

- Never commit secrets, credentials, production connection strings, or local environment files.
- Validate required production configuration at startup and avoid leaking stack traces or secrets in responses.
- Keep dependency additions minimal and review generated or staged files before committing.
