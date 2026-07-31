# ADR 005: Use Zustand for shared client state

- Status: Accepted
- Date: 2026-07-31

## Context

TrackRanker now has UI state that needs to survive component unmounts, route navigation, and—in the case of drafts and filters—browser refreshes. Keeping this state independently inside each page would lose work or require duplicated coordination logic.

## Decision

Use one typed Zustand store for shared, persistent client-side UI state while keeping server-owned application data in the existing API and MongoDB architecture.

## Rationale

- Zustand suits the project's size because it provides direct typed actions and selectors without reducers, providers, or a large framework.
- An unfinished new-session draft belongs to the athlete's browser until it becomes a successfully created server record.
- Session and confidence filters are user interface preferences shared across route visits, not domain data.
- API responses do not belong in Zustand because MongoDB and the typed API remain their source of truth; duplicating them would introduce cache invalidation and stale-data risks.
- Local React state remains appropriate for temporary, component-specific behavior such as confirmations, focus, disclosures, loading, and errors.

## Persistence trade-offs

localStorage preserves convenience across refreshes and browser reopening, but it is browser-local, synchronous, user-editable, and not a secure data store. TrackRanker therefore persists only a minimal draft and controlled filter values, never credentials, API results, completion evidence, or gamification totals.

Persisted values are treated as untrusted. A versioned merge validates the draft shape and controlled values, discarding malformed drafts and returning unknown filters to defaults. This provides safe forward evolution without a complex migration framework.

## Alternatives considered

- Component state remains simpler for one-off interactions but cannot preserve drafts or filters across unmounts.
- React Context could share values but would require custom persistence and broader rerenders.
- Redux would add unnecessary ceremony for the current scope.
- Server-side drafts would require new endpoints, persistence rules, and user identity that are outside this milestone.
- A server-state cache such as React Query addresses a different problem and is intentionally deferred.
