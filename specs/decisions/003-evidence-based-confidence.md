# ADR 003: Build confidence from the athlete's own evidence

- Status: Accepted
- Date: 2026-07-29

## Context

TrackRanker's primary differentiator is helping sprint athletes trust themselves and their training process. Generic quotes or invented encouragement are disconnected from what the athlete actually completed, while confidence ratings and reflections already capture relevant personal evidence.

## Decision

Confidence features will primarily surface evidence from the athlete's own completed sessions and reflections. The confidence-history read flow derives its data from `SessionCompletion` and joins the corresponding `TrainingSession`; it does not create duplicate confidence records.

## Rationale

- Personal reflections and recorded ratings are more relevant and verifiable than generic motivational content.
- Reporting stored data respects uncertainty and avoids unsupported psychological conclusions.
- Difficult sessions, unchanged confidence, and lower confidence remain visible because honest evidence is more useful than forced positivity.
- Reusing completion data keeps one source of truth and prevents confidence records drifting from their session outcome.
- A read-specific DTO gives the page the joined context it needs without exposing MongoDB documents.

## Trade-offs

- The page is only as complete as the athlete's recorded reflection data.
- Joining two repository result sets in the application service is suitable for the current single-athlete project scale but may need a more efficient read model later.
- Reflection-only entries provide useful evidence but cannot contribute to paired comparisons.
- Evidence-based language is deliberately less celebratory than gamified or generated encouragement.

