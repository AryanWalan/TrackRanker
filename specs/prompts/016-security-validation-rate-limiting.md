You are implementing the next TrackRanker milestone.

Milestone 16: Complete the selected Security Measures advanced requirement.

IMPORTANT:
- Do NOT run git add.
- Do NOT create a git commit.
- Do NOT push.
- I will stage and commit manually.
- Do not add unrelated application features.
- Do not redesign the frontend.
- Do not change TrackRank, confidence, session, or gamification behaviour.
- Do not use npm audit fix --force.

# Current audited state

The repository has already been audited.

The following milestones are COMPLETE:

- Dashboard landing experience.
- EF Core + MongoDB basic-requirement compliance.
- Zustand state management.

Cypress is implemented but still requires final real-suite verification.

The Security advanced requirement is currently PARTIALLY COMPLETE.

Existing validation/sanitisation already includes substantial measures such as:

- DTO validation.
- Required-field validation.
- enum validation.
- numeric range validation.
- string-length validation.
- service-level validation where required.
- trimming required and optional strings.
- converting whitespace-only optional strings appropriately.
- backend-generated IDs.
- separation between API DTOs and persistence entities.
- tests for invalid requests.

The missing security measure is RATE LIMITING.

The selected three advanced requirements must remain:

1. Security Measures
   - Data validation / sanitisation
   - Rate limiting

2. Zustand State Management

3. Cypress End-to-End Testing

This milestone should complete Advanced Requirement #1.

# Assessment goal

The assessment requires a minimum of TWO security measures with justification in the
README.

TrackRanker will use:

1. Data validation / sanitisation
2. API rate limiting

Both need to be genuinely implemented, tested, and documented.

Do not count dependency auditing as one of the two selected measures.

# Before changing code

Read:

- AGENTS.md
- README.md
- backend/TrackRanker.Api/Program.cs
- backend DTOs
- backend services
- backend controllers
- backend validation logic
- current backend tests
- current EF Core configuration
- E2E testing/reset infrastructure
- all relevant current security/documentation specs

Also inspect:

- frontend/package.json
- current npm audit result

Preserve all previous specs/prompts files unchanged.

# Part 1: Audit existing validation and sanitisation

Before changing validation code, document what TrackRanker already does.

Check all externally writable API inputs, especially:

TrainingSession create/update:
- session type
- status where applicable
- prescription
- purpose
- focus cue
- success criteria
- coach notes
- intended intensity
- date
- title/custom title if applicable

SessionCompletion create/update:
- actual intensity
- perceived difficulty
- repetition numbers
- set numbers
- distances
- times
- repetition notes
- reflection text
- coach feedback
- confidence before
- confidence after

Do not assume validation is complete simply because some DTOs have attributes.

Identify any genuine gaps.

# Validation requirements

Ensure server-side validation protects API boundaries.

Preserve existing ranges and maximum lengths where already intentionally defined.

Examples already used by TrackRanker include concepts such as:

- confidence: 1–5
- actual intensity: 1–10
- perceived difficulty: 1–10
- repetition/set numbers >= 1
- distance/time > 0
- bounded notes/reflection lengths

Use the CURRENT product rules as the source of truth.

Do not arbitrarily change established limits.

# Sanitisation philosophy

TrackRanker accepts free-text athlete content.

Sanitisation should preserve legitimate athlete input while preventing malformed or
meaningless stored values.

Appropriate sanitisation includes:

- trimming leading/trailing whitespace
- normalising whitespace-only optional fields to null/empty according to current model
  conventions
- rejecting required values that become empty after trimming
- enforcing maximum lengths server-side

Do NOT:

- remove normal punctuation
- strip apostrophes
- strip mathematical symbols used in sprint prescriptions
- remove characters such as:
  ×
  %
  –
  /
  :
- transform athlete-written reflections unnecessarily
- use aggressive regex "sanitisation" that damages valid sprint notation

Examples that must remain valid:

3 × 150m, 10 min rest

2 sets of 20m – 30m – 30m – 20m

Stay relaxed through the final 50m.

Do not HTML-encode data before persistence unless the current architecture specifically
requires it.

React already escapes normal rendered text by default.

Do not introduce dangerous raw HTML rendering.

# Validation centralisation

Avoid duplicating sanitisation logic unnecessarily.

If current service helpers already handle trimming/optional text normalisation, reuse or
slightly improve them.

If multiple services contain identical simple text-normalisation code, a small shared
helper is acceptable.

Do not create an elaborate validation framework.

Do not replace DataAnnotations with a new validation library.

Do not add FluentValidation solely for this milestone.

# Part 2: Implement rate limiting

Use the built-in ASP.NET Core rate-limiting middleware.

Use:

Microsoft.AspNetCore.RateLimiting

and the platform-provided rate limiter APIs.

Do not add an unnecessary third-party package.

Configure rate limiting through:

builder.Services.AddRateLimiter(...)

and:

app.UseRateLimiter()

Place middleware in the correct pipeline order.

# Rate-limiting design

TrackRanker currently has no authentication.

Therefore rate limiting should be based primarily on the requesting client/IP rather
than user account identity.

Implement two straightforward policies.

## Policy 1: General API

Suggested name:

api

Purpose:
Protect normal read/API traffic from excessive repeated requests.

Suggested local/default limit:

120 requests per minute per client/IP.

Use a Fixed Window, Sliding Window, or Token Bucket limiter.

Choose one simple built-in strategy and document the decision.

## Policy 2: Write operations

Suggested name:

write

Purpose:
Protect state-changing endpoints from excessive automated requests.

Suggested limit:

30 requests per minute per client/IP.

Apply this to endpoints that create, update, or delete application data.

Do not make these numbers configurable unless doing so remains simple and useful.

If configuration is introduced, use strongly typed settings with safe defaults.

# Rate-limit scope

Apply general API limiting to relevant public API endpoints.

Apply the stricter write policy to state-changing endpoints such as:

POST /api/training-sessions
PUT /api/training-sessions/{id}
DELETE /api/training-sessions/{id}

POST /api/training-sessions/{sessionId}/completion
PUT /api/training-sessions/{sessionId}/completion
DELETE /api/training-sessions/{sessionId}/completion

Do not create new API routes solely for rate limiting.

# Health endpoint

Do not apply an overly restrictive write policy to:

GET /api/health

Health checks may be called by deployment platforms.

It may:

- use the normal/general API policy
or
- be intentionally exempt

Choose deliberately and document why.

Prefer not to make health checks fragile.

# Scalar/OpenAPI

Do not let rate limiting break Scalar documentation.

Scalar documentation should remain accessible according to the application's current
environment/security design.

Do not expose internal configuration values in Scalar.

# E2E reset endpoint

TrackRanker may contain a guarded E2E reset endpoint.

Do NOT accidentally make E2E tests flaky by applying normal public API rate limits to
bulk test reset behaviour.

If the reset endpoint exists:

- preserve its existing E2E-only guard
- keep it inaccessible when E2E mode is disabled
- either exempt it from public rate limiting or give it an appropriate E2E-specific
  treatment

Document the decision.

Do not weaken its existing security controls.

# Rate-limit partitioning

Partition requests using a stable client identifier.

Preferred:

RemoteIpAddress

Example concept:

context.Connection.RemoteIpAddress?.ToString()

Use a safe fallback for environments where no address is available.

Do not use arbitrary user-controlled headers directly as the rate-limit identity.

Do NOT trust:

X-Forwarded-For

without trusted proxy/forwarded-header configuration.

# Production reverse proxy note

TrackRanker will later be deployed behind a hosting platform/reverse proxy.

Document that production deployment must configure trusted forwarded-header behaviour
appropriately if real client IP partitioning is required behind the proxy.

Do NOT broadly configure forwarded headers in this milestone unless it can be done
securely with known trusted proxies.

Deployment-specific proxy configuration belongs to the deployment milestone.

# Rejection behaviour

Rate-limited requests should return:

HTTP 429 Too Many Requests

Configure a concise API-safe rejection response.

Example response concept:

{
  "error": "Too many requests. Please try again shortly."
}

Do not expose:

- stack traces
- limiter internals
- server implementation details

If practical, provide:

Retry-After

through the limiter's available metadata or standard middleware behaviour.

Do not invent inaccurate retry durations.

# UX implications

No major frontend change is required.

However, inspect the central frontend API error handling.

If HTTP 429 currently surfaces an incomprehensible generic error, make the SMALLEST
reasonable improvement so the athlete sees something understandable such as:

"Too many requests. Please wait a moment and try again."

Do not build a new global error system.

Do not add retry loops.

Do not automatically spam the API with retries after receiving 429.

# Rate limiting and CORS

Preserve current CORS behaviour.

Do not loosen CORS as part of this milestone.

Do not use CORS as one of the selected security measures.

# Rate limiting and EF Core

Do not change:

- TrackRankerDbContext
- EF MongoDB collection mappings
- repository persistence design
- MongoDB transactions
- existing collection names
- ObjectId behaviour

Rate limiting belongs at the HTTP/API layer.

# Backend tests: rate limiting

Add meaningful automated tests.

Cover at minimum:

1. A normal API request below the limit succeeds.
2. Repeated requests eventually return HTTP 429.
3. A rate-limited response does not return HTTP 500.
4. A stricter write policy exists for state-changing routes.
5. Normal read traffic and write traffic use their intended policy.
6. Health endpoint behaves according to the chosen documented policy.
7. E2E reset behaviour remains usable only under its existing E2E guard.
8. Rate limiting does not bypass existing DTO validation.
9. Rate limiting configuration is registered in the application.

Avoid slow tests.

Do not create tests that literally wait one minute for a window to reset.

Allow test-specific rate-limit options or a test application factory configuration if
needed.

Keep test production behaviour representative.

# Backend tests: validation/sanitisation

Strengthen tests only where audit gaps exist.

Cover representative cases such as:

1. Required whitespace-only field is rejected.
2. Valid required field is trimmed before persistence.
3. Optional whitespace-only reflection/clarity field does not persist meaningless text.
4. Maximum-length validation rejects excessive input.
5. Valid sprint notation containing ×, %, –, etc. remains accepted.
6. Invalid confidence/rating values are rejected.
7. Client-provided IDs/timestamps remain ignored/not accepted as applicable.

Do not duplicate every existing validation test.

Focus on proving the security measure comprehensively enough for marking.

# Security documentation

Create:

specs/16-security-validation-rate-limiting.md

Document:

## Threat/context

TrackRanker exposes a public API and accepts athlete-entered text.

Potential concerns include:

- malformed input
- meaningless/oversized text
- automated excessive API calls
- resource exhaustion
- abusive repeated writes

## Security Measure 1: Data validation / sanitisation

Explain:

- DTO validation
- service validation
- trimming/normalisation
- bounded input lengths
- numeric ranges
- controlled enum values
- backend-generated identifiers
- why preserving valid sprint notation matters
- why React escaping is preferred over destructive HTML filtering for normal rendered
  text

Include concrete TrackRanker examples.

## Security Measure 2: Rate limiting

Explain:

- policy type
- partitioning strategy
- general API limit
- write limit
- HTTP 429
- why writes use a stricter policy
- health endpoint decision
- E2E endpoint decision
- reverse-proxy consideration for deployment

## Limitations

Document:

- rate limiting is not authentication
- IP-based limiting can group multiple users behind one address
- distributed/multi-instance deployments may require a shared/distributed limiting
  strategy depending on hosting architecture
- proxy handling will be verified during deployment

Do not claim perfect security.

# Security ADR

Create:

specs/decisions/011-api-security-controls.md

Document:

Context:
TrackRanker has no login and exposes CRUD endpoints publicly.

Decision:
Use server-side validation/sanitisation plus ASP.NET Core rate limiting.

Explain:

- why these are meaningful for TrackRanker
- why authentication/RBAC is not selected for the current single-athlete/no-account
  product
- why password hashing does not apply without passwords
- why anti-CSRF is not the primary selected control for the current API architecture
- why rate limiting adds protection even without accounts
- why rate limiting is partitioned by client/IP
- trade-offs

# README

Update the existing:

## Advanced Requirements Selected

Keep EXACTLY three marked advanced requirements:

1. Security Measures
2. Zustand State Management
3. Cypress End-to-End Testing

For Security, set:

Status: Implemented

ONLY if both validation/sanitisation and rate limiting are successfully implemented
and tested.

Under Security include two clearly labelled sub-measures:

### Data validation / sanitisation

Explain briefly:

- server-side enforcement
- ranges/length limits
- trimming/normalisation
- DTO/service boundary
- why it matters

### Rate limiting

Explain briefly:

- ASP.NET Core built-in rate limiting
- policy structure
- 429 behaviour
- why it matters for TrackRanker's public API

The assessment specifically requires justification of importance and implementation,
so make this explicit rather than just listing package names.

Do not list dependency auditing as one of the two measures.

# npm audit finding

Run:

npm audit

Do not run:

npm audit fix --force

Current audit information from the repository audit indicated:

- installed React Router packages were not currently reported as vulnerable
- one high-severity transitive finding involved nanoid through the frontend build
  toolchain

Verify the CURRENT result rather than assuming it is unchanged.

Document the current dependency-security finding in an appropriate README/spec known
issues section.

Explain:

- advisory/package
- whether it affects runtime or build tooling
- available remediation if known
- why a forced breaking upgrade was or was not applied

Do not suppress the audit result.

Do not upgrade unrelated dependencies unless there is a clearly compatible,
non-breaking fix.

Dependency auditing is separate from the two marked Security Measures.

# Existing functionality to preserve

Do not break:

- Dashboard landing experience
- session CRUD
- EF Core MongoDB persistence
- session drafts
- filters
- Repeat Session if implemented
- completion logging
- repetition results
- reflections
- confidence history
- Confidence page
- TrackRank progress
- achievements
- XP feedback
- Cypress infrastructure
- E2E guarded reset
- health endpoint
- Scalar
- existing tests

# Out of scope

Do NOT implement:

- authentication
- registration
- passwords
- password hashing
- RBAC
- user accounts
- coach accounts
- OAuth
- JWT
- WebSockets
- Storybook
- Docker changes
- theme switching
- new gamification
- deployment
- production reverse-proxy configuration
- unrelated frontend redesigns
- npm audit fix --force

# Prompt evidence

Create:

specs/prompts/016-security-validation-rate-limiting.md

Copy this COMPLETE prompt into the file exactly.

Do not modify any earlier prompt evidence.

Verify previous prompt files remain unchanged.

# Verification

Run:

dotnet restore backend\TrackRanker.slnx

dotnet build backend\TrackRanker.slnx

dotnet test backend\TrackRanker.slnx --no-build

From frontend:

npm test

npm run build

Run:

npm audit

Also run:

git diff --check
git status

Perform:

- secret scan
- generated-file scan
- prompt-integrity check
- package-reference review

Ensure none of these are accidentally tracked:

node_modules
bin
obj
dist
coverage
Cypress generated videos/screenshots
database dumps
secret env files

Do NOT stage.
Do NOT commit.
Do NOT push.

# Manual verification

Run the application locally.

Using an HTTP client or scripted request loop:

1. Confirm normal GET request succeeds.
2. Send enough repeated API requests to trigger the general limiter.
3. Confirm HTTP 429.
4. Confirm response body is concise and safe.
5. Confirm normal API behaviour returns after the limiter window resets.
6. Trigger the write limiter against an isolated/temporary endpoint/data flow where
   safe.
7. Confirm write limiting does not corrupt data.
8. Confirm invalid DTO requests still return validation errors.
9. Confirm Scalar remains usable.
10. Confirm health behaves according to the documented exemption/policy.

Do not permanently create large numbers of development records merely to test rate
limiting.

Use an isolated/test database or non-destructive request strategy where appropriate.

# Cypress compatibility

Because Cypress is already implemented but awaiting final verification:

Perform at least one check that security middleware does not obviously break the E2E
configuration.

Do not make full Cypress verification the main goal of this milestone.

If practical after normal verification:

run:

npm run cy:run

once using the dedicated E2E database.

If environmental setup prevents this, report it clearly.

The dedicated "run twice and record final evidence" work remains the next milestone.

# Success criteria

This milestone is complete only when:

1. Validation/sanitisation is demonstrably implemented.
2. Rate limiting is genuinely active.
3. Excessive requests return 429.
4. Write routes receive appropriate protection.
5. Rate limiter tests pass.
6. Existing backend tests remain passing.
7. Existing frontend tests remain passing.
8. README explicitly justifies both measures.
9. Security is marked Implemented in the advanced-requirements section.
10. No unrelated product behaviour changed.

# Final response

When finished, report:

1. Initial validation/sanitisation audit.
2. Any validation gaps fixed.
3. Rate-limiting architecture.
4. General API policy.
5. Write policy.
6. Client partitioning strategy.
7. HTTP 429 behaviour.
8. Health endpoint handling.
9. E2E reset handling.
10. Reverse-proxy/deployment consideration.
11. Backend tests added/updated.
12. Frontend changes, if any.
13. Exact restore/build/test results.
14. Manual 429 verification.
15. npm audit result.
16. README advanced-feature status.
17. Documentation created/updated.
18. Files created/modified.
19. Warnings or unresolved risks.
20. git status.
21. Recommended next milestone.

IMPORTANT:

Do NOT stage changes.
Do NOT create a commit.
Do NOT push.
Do NOT report a commit hash.

I will review and commit manually.
