# Decision 011: API security controls

## Status

Accepted.

## Context

TrackRanker currently has no login or account model and exposes CRUD endpoints for a single-athlete training application. The API accepts structured numeric values and free-text prescriptions, notes, and reflections. Without boundary validation, malformed or meaningless values could be stored. Without request-volume controls, automated clients could repeatedly consume API and database resources or issue abusive writes.

The assessment requires two meaningful security measures with implementation justification.

## Decision

Use server-side validation/sanitisation and ASP.NET Core's built-in rate limiting as TrackRanker's two selected security measures.

DataAnnotations enforce required values, controlled enums, numeric ranges, and maximum lengths at the HTTP boundary. Services validate when called outside MVC, trim legitimate athlete text, and normalise whitespace-only optional fields. A non-whitespace rule protects required prescriptions while preserving punctuation and sprint notation.

Use named fixed-window rate-limit policies partitioned by the connection's remote IP address. Normal public API traffic receives 120 requests per minute, while state-changing session and completion routes receive 30 writes per minute. Rejections return HTTP 429 with safe JSON and `Retry-After` when accurate metadata is available.

Health checks and the guarded E2E reset endpoint are explicitly exempt. Health must remain dependable for hosting probes. Cypress reset calls must remain repeatable, while their existing non-production, opt-in, `_e2e` database guards continue to provide access control.

## Rationale

- Validation and normalisation protect the integrity of athlete evidence at the point it enters the application.
- Rate limiting adds useful resource and abuse protection even without user accounts.
- A stricter write policy reflects the higher cost and impact of state changes.
- Remote IP is the best currently available server-controlled partition key. Arbitrary forwarded headers are not trusted without deployment-specific proxy configuration.
- Built-in platform middleware avoids a third-party dependency and integrates with endpoint metadata and tests.

Authentication and role-based access control are not selected because the current product has no accounts, identities, or coach/athlete authorization model. Password hashing does not apply because TrackRanker stores no passwords. Anti-CSRF is not the primary selected control because the current API does not use browser cookie authentication; that decision must be revisited if cookie-based authentication is introduced.

## Trade-offs

- IP partitions can group multiple users behind NAT and can be bypassed by distributed clients.
- Each application instance maintains its own limiter state. A scaled deployment may need a gateway or distributed strategy.
- Fixed windows can allow bursts near a boundary, but they are straightforward to reason about for the current scale.
- Trusted forwarded-header handling cannot be completed safely until the deployment proxy topology is known.
- Rate limiting does not replace validation, authentication, authorization, monitoring, or dependency maintenance.
