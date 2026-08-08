You are implementing the next TrackRanker milestone.

Milestone 17: Final Cypress E2E Verification and Stability Evidence.

IMPORTANT:
- Do NOT add new product features.
- Do NOT redesign the application.
- Do NOT change gamification rules.
- Do NOT change EF Core persistence unless a genuine Cypress defect reveals a bug.
- Do NOT run git add.
- Do NOT commit.
- Do NOT push.
- I will stage and commit manually.

# Current state

TrackRanker currently has:

- Dashboard landing experience complete
- EF Core + MongoDB compliance complete
- Zustand state management complete
- Security measures complete
- Cypress installed and configured
- Dedicated E2E database
- Guarded E2E reset infrastructure
- Four Cypress spec files
- Six E2E scenarios
- One successful full Cypress run already completed during Milestone 16:
  4/4 specs passed
  6/6 scenarios passed

The remaining goal is to prove the E2E suite is repeatable and stable before deployment.

# Main goal

Run the complete Cypress suite again against the real local stack:

Browser
→ React frontend
→ .NET API
→ EF Core
→ MongoDB E2E database

Then document both successful runs.

Do not expand the suite unless a meaningful missing critical journey is discovered.

# Before running

Read:

- AGENTS.md
- README.md
- specs/15-cypress-e2e-testing.md
- current Cypress configuration
- all Cypress specs
- E2E reset infrastructure
- frontend package.json
- backend E2E configuration
- current git status

Confirm:

- E2E database is trackranker_e2e
- normal development database is NOT used
- E2E__Enabled=true is only used for the test API process
- MongoDb__UseTransactions=false remains appropriate for local standalone MongoDB
- Cypress screenshots/videos remain ignored
- no arbitrary fixed waits are used
- selectors are primarily accessible selectors

# Run the full stack

Start the backend using the dedicated E2E database.

Start the frontend.

Run:

npm run cy:run

This must be a NEW full run after the successful Milestone 16 run.

# Required verification

Confirm all existing critical workflows pass:

1. Landing page / onboarding
2. Create training session
3. Complete and reflect
4. Confidence evidence
5. TrackRank / XP / achievements
6. Repeat Session if currently covered
7. Zustand draft persistence if currently covered

Do not add tests solely to inflate coverage.

# Repeatability

The current milestone requires evidence of two successful full-suite runs.

One run already succeeded during Milestone 16.

This milestone should provide the second successful run.

If the new run fails:

1. Identify whether the failure is:
   - genuine product bug
   - E2E isolation issue
   - selector brittleness
   - timing/race condition
   - environment issue

2. Fix only the underlying issue.

3. Do not use arbitrary cy.wait(number) calls.

4. Re-run the COMPLETE suite until it passes.

If a fix is required, run the entire suite again after the fix so the final reported
state is a clean full-suite pass.

# Database isolation verification

Before and after the Cypress run, verify:

- normal development database remains untouched
- E2E database is the only automated-test database used
- E2E reset clears test records predictably
- tests do not depend on execution order
- no duplicate or stale records affect later scenarios

Do not inspect or modify development records beyond read-only verification if needed.

# Security compatibility

Milestone 16 introduced:

- general API rate limit
- write rate limit
- E2E reset exemption
- health exemption

Confirm Cypress remains compatible with the final security middleware.

Verify:

- Cypress requests do not unexpectedly receive 429
- E2E reset remains available only when E2E__Enabled=true
- E2E reset is still unavailable in ordinary application configuration
- test determinism has not been weakened to work around rate limiting

Do not increase production rate limits merely to make Cypress pass.

# Test quality audit

Review the current Cypress suite for:

- arbitrary waits
- brittle CSS selectors
- dependence on MongoDB-generated IDs
- dependence on spec execution order
- unnecessary duplication
- direct API stubbing of workflows that are supposed to be true E2E
- hidden dependency on development database state

Fix only genuine quality issues.

Prefer:

- findByRole / role-based Cypress queries if already configured
- contains
- labels
- visible headings
- buttons
- links

Use data-cy only where needed.

# README

Update the Advanced Requirements section only if necessary.

Ensure exactly these three advanced requirements remain:

1. Security Measures — Implemented
2. Zustand State Management — Implemented
3. Cypress End-to-End Testing — Implemented

For Cypress, briefly state that:

- Cypress exercises real browser → frontend → API → MongoDB workflows
- tests use a dedicated trackranker_e2e database
- automated data reset is guarded to E2E mode
- the complete suite was successfully executed repeatedly

Do not claim CI execution unless CI actually exists.

# Cypress documentation

Update:

specs/15-cypress-e2e-testing.md

Add a verification section recording:

Run 1:
- completed during Milestone 16
- 4/4 specs passed
- 6/6 scenarios passed

Run 2:
- record the result from this milestone

Document:

- date/time if practical
- command used
- database used
- result
- whether any fixes were required
- confirmation normal development data was untouched

Do not fabricate timing or results.

# New milestone documentation

Create:

specs/17-cypress-verification.md

Document:

- purpose of final verification
- why repeatability matters
- existing test architecture
- security compatibility
- database isolation
- second full-suite result
- any flakiness discovered
- any fixes made
- confirmation the suite is ready for production regression testing

# Prompt evidence

Create:

specs/prompts/017-cypress-verification.md

Copy this COMPLETE prompt into the file exactly.

Do not modify earlier prompt evidence.

# Verification commands

Run:

dotnet build backend\TrackRanker.slnx

dotnet test backend\TrackRanker.slnx --no-build

From frontend:

npm test
npm run build
npm run cy:run

Also run:

git diff --check
git status

Perform:

- secret scan
- generated-file scan
- prompt-integrity check

Confirm no generated Cypress artifacts are tracked:

cypress/screenshots
cypress/videos

# Manual checks

After the Cypress run, manually confirm:

1. Normal TrackRanker development data remains unchanged.
2. E2E data is cleaned/reset appropriately.
3. No screenshots/videos are unintentionally tracked.
4. No test relies on localhost state left by a previous spec.
5. E2E reset remains unavailable when E2E mode is disabled.

# Out of scope

Do NOT implement:

- deployment
- Azure configuration
- Vercel configuration
- production MongoDB
- new security measures
- authentication
- new features
- new achievements
- new analytics
- UI redesign
- Docker
- Storybook
- WebSockets
- dependency upgrades unrelated to a failing Cypress test
- npm audit fix --force

# Success criteria

This milestone is complete when:

1. The second full Cypress run passes.
2. The existing Milestone 16 successful run is documented as Run 1.
3. Run 2 is documented accurately.
4. All Cypress specs/scenarios pass.
5. E2E database isolation is confirmed.
6. Normal development data remains untouched.
7. Rate limiting does not break E2E workflows.
8. No arbitrary waits or major test-quality problems remain.
9. README correctly marks Cypress implemented.
10. No unrelated application behaviour changed.

# Final response

When finished, report:

1. Cypress version.
2. Run 1 evidence.
3. Run 2 result.
4. Specs/scenarios passed.
5. Whether any flaky tests were found.
6. Fixes made, if any.
7. Database isolation result.
8. Security/rate-limit compatibility result.
9. Development database integrity result.
10. Backend test result.
11. Frontend test result.
12. Frontend build result.
13. Documentation updated.
14. README advanced-requirement status.
15. Files modified/created.
16. Warnings or unresolved risks.
17. git status.
18. Recommended next milestone.

IMPORTANT:

Do NOT stage.
Do NOT commit.
Do NOT push.

I will review and commit manually.
