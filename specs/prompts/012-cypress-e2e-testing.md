You are implementing a major advanced-requirement milestone for TrackRanker.

Milestone 12: Cypress End-to-End Testing.

IMPORTANT:
- Do NOT run git add.
- Do NOT create a git commit.
- Do NOT push.
- I will stage and commit manually.
- Do not redesign application features during this milestone.
- Do not use Cypress failures as an excuse for broad application refactors.
- Fix genuine usability/testability defects only when necessary.

Before making changes:

1. Read AGENTS.md.
2. Read README.md.
3. Read all current /specs documents.
4. Review all existing frontend and backend tests.
5. Review the current application routes.
6. Review:
   - Dashboard
   - Sessions
   - TrainingSessionForm
   - Session details
   - SessionCompletionForm
   - Confidence
   - Progress
   - Repeat Session if implemented
   - Zustand state if implemented
7. Review the frontend API configuration.
8. Review backend MongoDB configuration.
9. Review package.json.
10. Preserve every previous specs/prompts file unchanged.

# Project context

TrackRanker is a full-stack training clarity, confidence and process-gamification
application for 100m, 200m and 400m sprinters.

The application uses:

Frontend:
- React
- TypeScript
- Vite
- React Router
- Zustand if currently implemented

Backend:
- C#
- .NET 10
- MongoDB
- Scalar API documentation

Testing already includes:
- Vitest
- React Testing Library
- xUnit

This milestone adds:

Cypress End-to-End Testing

as one of TrackRanker's three selected advanced assessment requirements.

# Advanced requirements

TrackRanker's intended marked advanced requirements are:

1. Security Measures
   - Data validation / sanitisation
   - Rate limiting

2. Zustand State Management

3. Cypress End-to-End Testing

This milestone completes the Cypress requirement.

Do not replace Cypress with Playwright or another E2E library.

# Environment information

Docker is NOT installed on this development machine.

Do not require Docker.

A local MongoDB Windows service is available on:

mongodb://127.0.0.1:27017

or localhost:27017.

Use the locally installed MongoDB service when manual/local E2E execution requires
MongoDB.

Do not modify docker-compose.yml merely because Docker is unavailable.

# Main goal

Add a reliable Cypress E2E test suite covering TrackRanker's most important real
athlete workflows.

The tests should verify behaviour across:

Browser
→ React frontend
→ .NET API
→ MongoDB

Unlike frontend component tests, these tests should exercise the real application.

# Testing philosophy

Do not attempt to test every field and every edge case through Cypress.

Unit/component tests already cover detailed validation.

Cypress should focus on a SMALL NUMBER of high-value user journeys.

Prefer approximately 4–6 excellent E2E scenarios over dozens of brittle tests.

# Critical requirement: test isolation

Cypress tests must not pollute the normal TrackRanker development database.

Do NOT use the standard:

trackranker

database for automated E2E tests.

Use a dedicated database such as:

trackranker_e2e

Configure this through environment configuration.

Preferred test backend configuration:

MongoDb__DatabaseName=trackranker_e2e

Do not hard-code E2E behaviour into production application logic.

# Database cleanup strategy

E2E tests must be repeatable.

A second run should behave identically to the first.

Implement a safe E2E database-reset approach.

Preferred approach:

Create a development/test-only backend endpoint or controlled E2E reset mechanism
ONLY if necessary.

For example:

POST /api/testing/reset

BUT:

This endpoint must NEVER be enabled in Production.

It must be available only when an explicit environment flag is enabled, such as:

E2E__Enabled=true

or in an equivalent clearly controlled test environment.

When disabled:

the route must not be available.

If a cleaner reset approach can be implemented entirely from Cypress without exposing
a reset endpoint, prefer that.

Document the chosen approach.

# Security of test reset functionality

If a reset endpoint is created:

- It must require explicit E2E configuration.
- It must not appear in normal production behaviour.
- It must reset only the configured E2E database.
- It must never accept a database name from the request.
- It must not expose arbitrary MongoDB operations.
- It must not be enabled by default.

Do not create a generic database admin endpoint.

# Cypress installation

Install:

cypress

as a development dependency.

Use the stable version compatible with the current Node/Vite project.

Do not add another browser-testing framework.

# Cypress structure

Create a conventional structure such as:

frontend/
├── cypress/
│   ├── e2e/
│   │   ├── onboarding.cy.ts
│   │   ├── session-workflow.cy.ts
│   │   ├── confidence-progress.cy.ts
│   │   └── repeat-session.cy.ts
│   └── support/
│       ├── commands.ts
│       └── e2e.ts
├── cypress.config.ts

Adjust filenames if a slightly cleaner structure fits the project.

Keep tests logically grouped.

# Cypress configuration

Configure baseUrl using an environment variable with a sensible local default.

Example:

http://localhost:5173

Do not hard-code production URLs.

The tests should be capable of running against:

- local frontend/backend
- eventually the deployed application where appropriate

Do not make deployment testing mandatory in this milestone.

# Add npm scripts

Add useful scripts such as:

"cy:open"
"cy:run"

and preferably:

"test:e2e"

Use clear naming.

Example concept:

npm run cy:open
npm run cy:run

Do not replace existing npm test behaviour.

`npm test` should continue running the existing Vitest suite.

# Stable selectors

Avoid brittle Cypress selectors such as:

.card > div:nth-child(3) > button

Prefer accessible selectors based on:

- role
- label
- button text
- link text

Where a stable selector is genuinely needed, add:

data-cy

sparingly.

Do not add data-cy attributes to every element.

The UI should primarily remain testable through accessible semantics.

# E2E scenario 1: first-time navigation

Create a test covering first-time comprehension and navigation.

Start with a clean E2E database.

Visit:

/

Verify:

- TrackRanker is visible.
- The application explains that it is for sprinters.
- The core workflow is visible.
- Log a session is available.
- Training history is available.
- Navigation includes:
  - Dashboard
  - Sessions
  - Confidence
  - Progress

Verify Profile is not visible if the UX milestone removed it.

Select:

Log a session

Confirm navigation to:

/sessions/new

This scenario should verify that the landing experience is actually understandable
and functional.

# E2E scenario 2: create a training session

Starting with clean data:

Navigate to Log a session.

Create a realistic sprint session.

Example:

Session type:
Speed Endurance

Prescription:
3 × 150m, 10 min rest

Planned intensity:
95

Use the actual valid value/range expected by the application.

If clarity is optional:

expand Add more clarity.

Enter realistic information such as:

Purpose:
Maintain high sprint speed as fatigue increases.

Focus:
Stay relaxed and maintain rhythm.

Success criteria:
Complete each repetition with controlled technique.

Submit:

Create session

Verify:

- creation succeeds
- user reaches the new session detail page
- prescription is displayed
- session status is Planned
- optional clarity is visible correctly
- session appears in Training history

Do not identify sessions through fragile assumptions about MongoDB IDs.

Use UI-visible content.

# E2E scenario 3: complete and reflect on training

Using a session created within the test or beforeEach setup:

Open its session detail page.

Choose:

Log completed session

Enter valid values such as:

Actual intensity:
8

Perceived difficulty:
7

Add at least one repetition result if the UI makes this natural.

Example:

Set:
1

Rep:
1

Distance:
150

Time:
17.5

Reflection:

What went well:
Stayed relaxed through the final section.

What improved:
Maintained rhythm better than expected.

Next focus:
Keep shoulders relaxed.

Coach feedback:
Good rhythm.

Confidence before:
3

Confidence after:
4

Save.

Verify:

- completion is displayed
- confidence values are displayed
- reflection is displayed
- session status is Completed

If immediate XP feedback exists:

verify the feedback is shown correctly.

Do not hard-code XP if doing so would duplicate implementation details unnecessarily,
but verifying expected process XP is acceptable because these rules are explicitly
part of the product.

# E2E scenario 4: confidence evidence

After completing/reflection-logging a session:

Navigate to:

/confidence

Verify:

- Confidence Evidence page loads
- completed session appears
- before/after confidence displays
- What went well displays
- What improved displays
- Next focus displays if entered
- View session link works

Verify that the evidence shown came from the actual session created earlier in the
test workflow.

Do not stub the confidence API.

This should exercise the real backend.

# E2E scenario 5: TrackRank progress

With known clean E2E data:

Navigate to:

/progress

Verify:

- TrackRank is visible
- XP is visible
- Completed Sessions count reflects real completions
- Reflection count reflects the stored reflection
- Confidence check-in count reflects paired confidence values
- expected achievements unlock from the test data

For one fully logged first session, the application may reasonably show:

20 XP completion
+10 reflection
+5 confidence
=35 XP

If these remain the actual product rules, verifying 35 XP is appropriate.

Verify:

First Finish

and:

Reflective Start

are unlocked when supported by the test data.

Do not modify progress rules as part of Cypress implementation.

# E2E scenario 6: Repeat Session

ONLY if Repeat Session currently exists.

From an existing completed session:

select:

Repeat session

Verify:

- session type is copied
- prescription is copied
- clarity fields are copied where appropriate
- date does NOT remain the historical date
- completion/reflection results are NOT copied
- new session begins Planned

Modify the prescription slightly.

Create the repeated session.

Verify:

- new session exists
- original session remains unchanged
- new session has its own detail page
- no completed outcome appears on the repeated session

If Repeat Session has not actually been implemented, do not create it solely for
the Cypress milestone.

Instead document that this scenario was skipped because the feature is not present.

# E2E scenario: error handling

Add at most one focused failure-path E2E test if useful.

Possible example:

attempt to submit a required session form with missing required information.

Verify:

- validation appears
- app remains usable

Do not duplicate every frontend validation unit test through Cypress.

# Custom Cypress commands

Create custom commands only when they clearly reduce repetition.

Possible examples:

cy.resetE2eData()

cy.createSessionThroughUi()

Avoid creating an enormous custom command abstraction that hides the behaviour being
tested.

Tests should remain readable to a marker.

# Test data

Use realistic sprint data.

Prefer examples such as:

Acceleration — 4 × 30m
Max Velocity — 5 × 30m Fly
Speed Endurance — 3 × 150m

Avoid generic:

Test Session
foo
bar
123

The tests should demonstrate TrackRanker's actual domain.

# No authentication assumptions

TrackRanker currently does not require login.

Do not implement authentication simply for Cypress.

Do not add test-user accounts.

# Zustand/localStorage

If Zustand persistence is currently implemented:

Ensure Cypress starts critical workflows from known client state.

Clear relevant TrackRanker localStorage before isolated tests when necessary.

Do not globally destroy browser storage in a way that invalidates features being tested.

For specific persistence tests, preserve state intentionally.

# Optional Zustand E2E check

If persistent session drafts exist:

Add ONE focused test proving:

1. Start filling /sessions/new.
2. Navigate away.
3. Return.
4. Draft is restored.

This is useful evidence for the Zustand advanced requirement.

Do not make this mandatory if Zustand is not currently implemented.

# Test execution documentation

README should clearly explain how to run E2E tests locally.

Include prerequisites:

- Node
- .NET 10
- MongoDB service
- frontend
- backend

Document the E2E database name.

Example local workflow:

Terminal 1:
set MongoDb__DatabaseName=trackranker_e2e
set E2E__Enabled=true
dotnet run --project backend\TrackRanker.Api

Terminal 2:
npm run dev

Terminal 3:
npm run cy:run

Use Windows-compatible commands where helpful because this repository is currently
developed on Windows.

Do not assume Docker.

# Prefer automated app startup if practical

Investigate whether a simple npm-based solution can safely start required development
servers before Cypress.

Do not add a large dependency solely for this unless it significantly improves
repeatability.

A documented three-terminal workflow is acceptable.

Reliability is more important than fancy orchestration.

# Cypress screenshots/videos

Use Cypress defaults sensibly.

Do not commit generated:

screenshots
videos

from test runs unless explicitly useful.

Add generated Cypress artifacts to .gitignore as appropriate:

cypress/screenshots
cypress/videos

Do not ignore actual Cypress source files.

# CI readiness

Configure Cypress so it can eventually run in CI.

Do not build a full GitHub Actions pipeline in this milestone unless the repository
already has one and the change is trivial.

The Cypress configuration should not depend on machine-specific absolute paths.

# Frontend test compatibility

All existing Vitest tests must continue passing.

Do not rewrite component tests into Cypress.

The test layers should be:

xUnit:
backend behaviour

Vitest/React Testing Library:
frontend components and interactions

Cypress:
critical full-system workflows

Document this testing pyramid.

# Backend tests

If a test-only reset endpoint is added:

Add backend tests proving:

1. Endpoint is unavailable when E2E mode is disabled.
2. Endpoint works only when explicitly enabled.
3. It targets only configured application/E2E storage.
4. No arbitrary database name can be supplied.

Do not weaken backend security for test convenience.

# Existing behaviour to preserve

Do not break:

- Dashboard onboarding
- Training history
- session CRUD
- streamlined session creation
- session draft persistence if implemented
- session filtering
- Repeat Session if implemented
- completion logging
- repetition results
- reflection
- confidence history
- confidence filtering
- Progress
- TrackRank
- achievements
- XP feedback
- health endpoint
- Scalar documentation
- current unit tests

# Out of scope

Do NOT implement:

- Playwright
- Selenium
- Storybook
- WebSockets
- authentication
- user accounts
- coach accounts
- multiplayer
- leaderboards
- new gamification rules
- new achievements
- dark mode
- theme switching
- Docker installation
- Docker-specific E2E infrastructure
- production deployment
- rate limiting
- new security features except protecting E2E reset functionality
- performance testing
- unrelated dependency upgrades
- React Router forced audit upgrades
- `npm audit fix --force`

Security Measures are the NEXT separate milestone.

# Documentation

Create:

specs/12-cypress-e2e-testing.md

Document:

- why E2E testing is needed
- relationship to existing unit/component tests
- Cypress architecture
- E2E database isolation
- database cleanup strategy
- key user journeys tested
- selector strategy
- localStorage handling
- local execution instructions
- CI readiness
- limitations
- deferred testing work

Create a design decision record:

specs/decisions/007-cypress-e2e-strategy.md

Document:

Context:

TrackRanker already has strong isolated frontend/backend automated tests, but those do
not prove that React, the .NET API and MongoDB work correctly together.

Decision:

Use Cypress to verify critical athlete workflows end-to-end.

Explain:

- why Cypress was selected
- why only critical flows are tested E2E
- why a separate E2E MongoDB database is required
- why accessible selectors are preferred
- why Cypress does not replace xUnit/Vitest
- why Docker is not required
- trade-offs

# AI prompt evidence

Create:

specs/prompts/012-cypress-e2e-testing.md

Copy this COMPLETE prompt into that file exactly.

Do not modify previous prompt evidence.

Verify all previous prompt files remain unchanged.

# README advanced requirement update

Update:

## Advanced Requirements Selected

Maintain EXACTLY these three selected requirements:

1. Security Measures
2. Zustand State Management
3. Cypress End-to-End Testing

Update Cypress status to:

Implemented

ONLY once the E2E suite successfully runs.

Explain briefly what workflows Cypress verifies.

Do not claim Security is fully implemented until the dedicated security milestone.

# README testing section

Add clear commands for:

Unit tests:

dotnet test
npm test

E2E:

npm run cy:run

Explain the required local services.

Do not require Docker.

# Verification

Run all existing test layers.

Backend:

dotnet build backend\TrackRanker.slnx

dotnet test backend\TrackRanker.slnx --no-build

Frontend:

npm test

npm run build

Cypress:

Run the application using the dedicated E2E database.

Then run:

npm run cy:run

All critical E2E scenarios must pass.

Also run:

git diff --check
git status

Perform:

- secret scan
- generated-file scan
- prompt-integrity check

Ensure generated Cypress videos/screenshots are not accidentally tracked.

Do NOT stage.

Do NOT commit.

Do NOT push.

# Manual verification

In addition to automated Cypress:

1. Inspect the Cypress run result.
2. Confirm tests are using trackranker_e2e rather than trackranker.
3. Confirm the normal development database was not modified.
4. Run the E2E suite twice.
5. Confirm both runs pass.
6. Confirm reset/isolation works.
7. Confirm TrackRank/achievement calculations are deterministic.
8. Confirm Cypress does not require Docker.
9. Stop temporary frontend/backend processes afterward.

# Quality requirements

- Tests must be deterministic.
- Tests must be readable.
- Tests must exercise the real API.
- Tests must not depend on execution order where avoidable.
- Tests must not use production data.
- Avoid arbitrary waits such as:
  cy.wait(5000)

Prefer waiting on actual UI/API state.

- Avoid brittle selectors.
- Do not hide application defects with excessive Cypress retries.
- Do not weaken product validation for testing.
- Do not suppress failing tests.
- Do not claim E2E is implemented until the real Cypress suite passes.

# Final response

When finished, report:

1. Cypress version installed.
2. Files created and modified.
3. E2E architecture.
4. E2E database isolation strategy.
5. Test reset strategy.
6. User journeys covered.
7. Cypress selectors strategy.
8. Any small application changes required for testability.
9. Backend tests added, if applicable.
10. Cypress scenarios and results.
11. Existing backend test results.
12. Existing frontend test results.
13. Build results.
14. Whether Cypress was run twice successfully.
15. Confirmation normal development data was untouched.
16. README advanced-requirement status.
17. Generated-artifact handling.
18. Warnings or unresolved issues.
19. git status summary.
20. Recommended next milestone.

IMPORTANT:

Do NOT stage changes.
Do NOT create a commit.
Do NOT push.
Do NOT report a commit hash.

I will review and commit manually.