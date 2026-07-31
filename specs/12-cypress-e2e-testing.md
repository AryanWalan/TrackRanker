# Milestone 12: Cypress end-to-end testing

## Purpose

TrackRanker already has focused xUnit backend tests and Vitest/React Testing Library frontend tests. Those suites provide fast, deterministic feedback but do not prove that a browser, the React application, the .NET API, and MongoDB work together. Cypress adds that system-level evidence without duplicating every validation and edge-case test.

## Testing architecture

The suite lives under `frontend/cypress` and is configured by `frontend/cypress.config.ts`.

- `onboarding.cy.ts` covers first-time comprehension and navigation.
- `session-workflow.cy.ts` creates a planned session and logs a completed outcome.
- `confidence-progress.cy.ts` verifies evidence and derived gamification.
- `repeat-session.cy.ts` verifies that a plan can be copied without copying an outcome.
- `support/commands.ts` contains only the reset and concise API-seeding helpers shared by several scenarios.

Cypress launches against `CYPRESS_BASE_URL`, defaulting to `http://localhost:5173`. Its API helpers use `CYPRESS_API_URL`, defaulting to `http://localhost:5000`. Requests are not stubbed: the scenarios exercise the real API and MongoDB.

## Relationship to other test layers

- xUnit verifies backend validation, services, progress calculations, and controller boundaries.
- Vitest and React Testing Library verify frontend rendering and detailed interactions with mocked API boundaries.
- Cypress verifies approximately six high-value athlete journeys across the complete local stack.

Cypress does not replace either isolated suite. Detailed form validation and error permutations remain cheaper and more reliable at the unit/component layers.

## Database isolation

Automated E2E runs use `MongoDb__DatabaseName=trackranker_e2e`. They must never use the normal `trackranker` database.

The API additionally refuses to start when E2E mode is enabled and the configured database name does not end in `_e2e`. This protects against accidentally enabling reset functionality while connected to normal application data.

## Cleanup strategy

`POST /api/testing/reset` deletes documents only from the configured application's `trainingSessions` and `sessionCompletions` collections. The endpoint:

- returns 404 unless `E2E__Enabled=true`;
- remains unavailable when the API environment is Production, regardless of the flag;
- accepts no database name or MongoDB operation from the request;
- is disabled by default;
- operates through the configured `IMongoDatabase`;
- verifies again that the configured database name ends in `_e2e`.

Every Cypress scenario calls `cy.resetE2eData()` before it begins. This makes scenarios independent of execution order and makes repeated suite runs deterministic.

## Journeys covered

1. Understands the sprinter-focused landing page, sees the core workflow and navigation, confirms Profile is absent, and opens Log a session.
2. Creates a realistic Speed Endurance session with optional clarity and finds it in training history.
3. Logs ratings, a timed repetition, reflection, paired confidence, Completed status, and immediate 35 XP feedback.
4. Reads the resulting confidence evidence and follows its View session link.
5. Verifies 35 process XP, completion/reflection/confidence counts, First Finish, and Reflective Start.
6. Repeats a completed session while preserving plan fields, refreshing the date, starting Planned, and leaving the original and its outcome unchanged.

## Selectors

The suite primarily uses visible headings, links, buttons, field labels, semantic navigation labels, and other athlete-visible text. It avoids structural selectors such as `nth-child` and adds no blanket `data-cy` attributes. A small number of existing descriptive class names are used only to scope status or achievement assertions where visible text alone would be ambiguous.

## Browser state

Zustand persists the `trackranker-workspace` entry. `cy.resetE2eData()` removes only this application-owned localStorage key before the app loads. It does not globally destroy unrelated browser storage. Draft persistence remains covered by the focused frontend component tests rather than adding a seventh E2E scenario.

## Local execution

Prerequisites are Node.js, .NET 10, and a MongoDB service listening at `mongodb://127.0.0.1:27017`. Docker is not required.

Start the backend from the repository root in PowerShell:

```powershell
$env:MongoDb__ConnectionString = "mongodb://127.0.0.1:27017"
$env:MongoDb__DatabaseName = "trackranker_e2e"
$env:E2E__Enabled = "true"
$env:Frontend__AllowedOrigin = "http://localhost:5173"
dotnet run --project backend\TrackRanker.Api
```

Start the frontend in a second terminal:

```powershell
cd frontend
npm run dev
```

Run Cypress in a third terminal:

```powershell
cd frontend
npm run cy:run
```

`npm run cy:open` opens the interactive runner. `npm run test:e2e` is an alias for the headless suite.

## CI readiness

Configuration contains no machine-specific paths. A future CI job can provide `CYPRESS_BASE_URL`, `CYPRESS_API_URL`, a MongoDB service, and safe backend E2E environment values before running the existing headless command. This milestone intentionally does not add a provider-specific CI pipeline.

## Limitations and deferred work

- Local execution currently uses a documented three-terminal workflow instead of adding another process-orchestration dependency.
- Cross-browser matrices and deployed-environment checks are deferred.
- Exhaustive validation and API failure paths remain at the xUnit/Vitest layers.
- Authentication and test users are not applicable because TrackRanker has no authentication.
- Security measures such as rate limiting remain a separate milestone.
