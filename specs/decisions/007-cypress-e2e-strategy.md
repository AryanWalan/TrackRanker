# ADR 007: Cypress end-to-end strategy

- Status: Accepted
- Date: 2026-07-31

## Context

TrackRanker has strong isolated frontend and backend automated tests, but those tests do not prove that React, the .NET API, and MongoDB work correctly together. The selected advanced requirements also explicitly include Cypress end-to-end testing.

System tests can become slow and brittle if they attempt to reproduce all unit-level coverage. They also need a safe way to manage persistent test data without touching an athlete's normal development records.

## Decision

Use Cypress 15 to verify six critical athlete workflows through the real local application stack.

Keep detailed backend behaviour in xUnit and frontend component behaviour in Vitest/React Testing Library. Cypress covers only the cross-layer journeys where integration evidence adds material confidence.

Run E2E tests against a separate `trackranker_e2e` MongoDB database. Reset that database through a narrow endpoint enabled only by explicit E2E configuration outside Production. The endpoint remains unavailable in Production, accepts no database name, exposes no general MongoDB operation, and is protected by an `_e2e` database-name guard.

Prefer accessible, athlete-visible selectors such as labels, headings, links, and button text. Use seeded records through real API requests only to keep independent scenarios concise; do not stub application APIs.

Support a locally installed MongoDB service. Docker is not required.

## Why Cypress

Cypress is the selected assessment technology and integrates directly with the existing TypeScript/Vite frontend. Its retryable DOM assertions, request helpers, browser runner, screenshots on failure, and headless mode support both local diagnosis and future CI execution.

## Consequences

### Positive

- Critical workflows are proven across browser, React, .NET, and MongoDB.
- Separate storage and a repeatable reset make tests deterministic.
- Accessible selectors keep tests aligned with usable UI semantics.
- The small suite remains readable and relatively fast.
- No Docker or authentication infrastructure is introduced.

### Trade-offs

- Three local processes must currently be started before the headless suite.
- The reset endpoint adds test-specific backend code that must remain tightly guarded.
- E2E tests are slower than isolated tests and cannot economically cover every edge case.
- Direct API seeding verifies the real backend but bypasses UI creation in scenarios where creation itself is not the behaviour under test.

## Alternatives considered

- Playwright or Selenium: rejected because Cypress is the selected advanced requirement and another browser framework would add duplication.
- Reusing `trackranker`: rejected because automated cleanup could destroy normal development data.
- Browser-only cleanup through public CRUD endpoints: rejected because it is slower, more complex, and cannot guarantee removal of every partially created record.
- Docker-specific test infrastructure: deferred because a local MongoDB Windows service is available and Docker must not be required.
- Moving all tests to Cypress: rejected because xUnit and Vitest provide faster, more focused coverage at their appropriate layers.
