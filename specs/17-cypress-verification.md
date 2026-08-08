# Milestone 17: Final Cypress verification

## Purpose

This milestone provides repeatability and stability evidence for TrackRanker's existing Cypress suite before production deployment work begins. One successful run can reveal integration defects, but a second clean full-suite run is stronger evidence that resets, selectors, request timing, security middleware, and persisted state do not rely on accidental local conditions.

No product behaviour, persistence implementation, rate limit, Cypress scenario, or dependency changed during this verification.

## Existing architecture and coverage

Four spec files contain six high-value scenarios:

1. `onboarding.cy.ts` verifies landing-page comprehension and navigation.
2. `session-workflow.cy.ts` verifies planned-session creation plus completion, reflection, confidence, and immediate progress feedback.
3. `confidence-progress.cy.ts` verifies confidence evidence, deterministic XP, TrackRank progress, and achievements.
4. `repeat-session.cy.ts` verifies copying a plan without copying its outcome.

The suite runs through Electron, the React/Vite frontend, the .NET controller API, EF Core repositories, and the dedicated MongoDB E2E database. API seeding helpers create prerequisite records through the real API; application workflow requests are not stubbed. Zustand draft persistence remains intentionally covered by focused Vitest/React Testing Library tests rather than duplicating that behaviour in Cypress.

## Test-quality audit

- There are no arbitrary `cy.wait(number)` calls. The one `cy.wait("@saveCompletion")` synchronizes with an aliased real completion request.
- Selectors primarily use visible headings, labels, buttons, links, and text. A few descriptive existing classes scope otherwise ambiguous evidence and achievement assertions; there are no `nth-child` selectors.
- MongoDB-generated IDs are obtained from real API responses, not hard-coded or predicted.
- Every scenario calls `cy.resetE2eData()` in `beforeEach`; scenarios do not depend on spec order.
- There are no `.only` or `.skip` markers, workflow stubs, arbitrary delays, or dependencies on the normal development database.
- Shared helpers remove duplication only for guarded reset and concise prerequisite creation.

No brittle selector, timing race, isolation failure, or other genuine quality defect was found, so no Cypress change was justified.

## Security compatibility

The complete suite passed with the final fixed-window middleware enabled. No scenario received an unexpected HTTP 429 and no production rate limit was changed. The E2E reset endpoint remains exempt from rate limiting so scenario setup is deterministic, while its existing protections remain intact:

- it returned 204 only on the test API configured with `E2E__Enabled=true` and `trackranker_e2e`;
- it returned 404 under ordinary configuration with `E2E__Enabled=false`;
- it accepts no caller-selected database name;
- it remains unavailable in Production;
- the general health exemption and public API/write policies were not altered.

## Database isolation

Run 2 explicitly used `trackranker_e2e`. Local standalone MongoDB continued to use `MongoDb__UseTransactions=false`.

Read-only checks before and after the suite showed that the normal `trackranker` database retained two sessions and one completion. The normal training-session response fingerprint was identical before and after the run. After the suite, a final guarded reset returned 204, the E2E session collection read returned zero records, and derived progress returned zero XP. This confirms predictable cleanup and no stale-record dependency.

## Second complete-suite result

- Date: 2026-08-08 (NZST)
- Start: 22:10:33
- Finish: 22:11:08
- Command: `npm run cy:run`
- Cypress: 15.19.0
- Browser: Electron 138, headless
- Node.js: 24.15.0
- Result: 4/4 specs passed; 6/6 scenarios passed
- Cypress-reported duration: 18 seconds
- Failures, pending, skipped, screenshots: 0
- Retries: disabled
- Fixes required: none

The earlier Milestone 16 run also passed 4/4 specs and 6/6 scenarios. Detailed two-run evidence is retained in [specs/15-cypress-e2e-testing.md](./15-cypress-e2e-testing.md).

## Stability conclusion

No flakiness was observed across the two full runs. The suite is ready to serve as a local production-regression check for the currently implemented critical journeys. A future deployment milestone may run the same suite in CI or against a deployed test environment, but this milestone does not claim CI execution or deployed-environment coverage.
