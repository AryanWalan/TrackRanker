# Cypress E2E execution evidence

## Relationship to the Cypress architecture specification

The Cypress architecture, journey selection, database guard, reset design, selectors, and local execution instructions were established in [Milestone 12](./12-cypress-e2e-testing.md). This evidence record preserves the requested Milestone 15 filename and records the two complete-suite executions used for final stability verification.

Both runs exercised the real local path:

```text
Electron browser → React/Vite frontend → .NET API → EF Core → MongoDB
```

No workflow request was stubbed.

## Verification runs

| Run | When | Command | Database | Result | Fixes required |
| --- | --- | --- | --- | --- | --- |
| 1 | 2026-08-08, during Milestone 16 | `npm run cy:run` | `trackranker_e2e` | 4/4 specs and 6/6 scenarios passed | None |
| 2 | 2026-08-08 22:10:33 to 22:11:08 NZST, during Milestone 17 | `npm run cy:run` | `trackranker_e2e` | 4/4 specs and 6/6 scenarios passed; Cypress duration 18 seconds | None |

Run 2 used Cypress 15.19.0 with Electron 138 in headless mode and Node.js 24.15.0. It completed with zero failed, pending, or skipped scenarios and with retries disabled.

## Isolation evidence

Before Run 2, the ordinary `trackranker` database was inspected read-only and contained two training sessions and one completion. Its training-session response SHA-256 fingerprint was:

```text
7F124E3DA81CEE3AD668656AC688BC8F06F8DF80EEEBBC570B25C7D244CC64DF
```

After Run 2, the counts remained two sessions and one completion and the same training-session fingerprint was returned. The ordinary API returned 404 for `POST /api/testing/reset` with `E2E__Enabled=false`.

The test API was explicitly configured with `MongoDb__DatabaseName=trackranker_e2e`, `E2E__Enabled=true`, and `MongoDb__UseTransactions=false` for the local standalone MongoDB service. A final guarded reset returned 204; subsequent reads returned zero sessions and progress derived from zero XP. No stale E2E record remained to influence another run.

## Repeatability conclusion

The same four specs and six independent scenarios passed in two complete runs. Every scenario resets E2E data in `beforeEach`, so no scenario depends on spec order or localhost data left by an earlier scenario. Normal development data remained untouched in both the pre-run and post-run observations.
