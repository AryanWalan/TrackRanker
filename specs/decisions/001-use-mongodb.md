# ADR 001: Use MongoDB

- Status: Accepted
- Date: 2026-07-29

## Decision

TrackRanker will use MongoDB as its application database through the official MongoDB C#/.NET driver.

## Context and rationale

Sprint sessions combine stable identifying fields with flexible repetition structures, timing data, effort ratings, and athlete reflections. Those records are naturally represented as cohesive documents and are likely to evolve as the training workflow is learned. MongoDB supports this shape without requiring premature relational decomposition.

## Expected benefits

- Session data can be read and written as a coherent aggregate.
- Repetition and reflection structures can evolve incrementally.
- The official driver integrates cleanly with .NET dependency injection and async APIs.
- Local development has a small Docker Compose footprint.

## Risks and trade-offs

- Flexible storage can permit inconsistent data if boundaries are weak.
- Cross-document relationships and transactions require deliberate design.
- Reporting needs may eventually favour denormalised read models or aggregation pipelines.
- Schema evolution still requires documented migrations and compatibility planning.

## Consistency controls

Flexibility does not mean unvalidated data. Backend models will define persisted document shapes, API DTOs will define external contracts, and validation will run before persistence. Repositories and services will centralise mapping and invariants. Controllers will never expose database models directly.
