# Session completion and reflection

## Purpose

Milestone 3 records what actually happened in a training session and gives the athlete structured, performance-focused reflection prompts. It supports confidence through evidence and useful next steps without judging the coach, generating encouragement, or offering medical interpretation.

## Planned and completed separation

`TrainingSession` remains the planned prescription: what was assigned, why, and what successful execution should look like.

`SessionCompletion` is the actual outcome: ratings, repetition results, reflection, coach feedback, and confidence captured after the work. Completion data is not embedded in the planned document so each concept can evolve without blurring the original prescription.

## SessionCompletion schema

| Field | Meaning |
| --- | --- |
| `Id` | Backend-generated MongoDB ObjectId |
| `TrainingSessionId` | ObjectId of exactly one parent training session |
| `CompletedAtUtc` | Backend-generated completion timestamp |
| `ActualIntensity` | How hard the athlete actually ran or worked, 1–10 |
| `PerceivedDifficulty` | How difficult the session felt, 1–10 |
| `RepetitionResults` | Optional embedded list of repetition outcomes |
| `Reflection` | Embedded structured reflection |
| `CreatedAtUtc` | Backend-generated creation timestamp |
| `UpdatedAtUtc` | Backend-maintained update timestamp |

## Repetition result structure

Each optional repetition result contains:

- `SetNumber`, integer at least 1
- `RepetitionNumber`, integer at least 1
- `DistanceMetres`, number greater than 0
- `TimeSeconds`, number greater than 0
- `Notes`, optional and limited to 500 characters

Zero repetition results are valid for technical, recovery, gym, or untimed sessions.

## Reflection structure

All text fields are optional and limited to 1,000 characters:

- `WentWell`
- `Improved`
- `WasDifficult`
- `NextFocus`
- `CoachFeedback`

`ConfidenceBefore` and `ConfidenceAfter` are optional integers using this scale:

1. Very low
2. Low
3. Neutral
4. Good
5. Very confident

These values are stored only. No score, chart, trend, or interpretation is calculated.

## Validation rules

- Actual intensity and perceived difficulty are required integers from 1 through 10.
- Nested repetition results and reflection fields are validated at both the API boundary and service boundary.
- Confidence values, when present, must be from 1 through 5.
- The route ID must be a valid MongoDB ObjectId.
- The parent training session must exist.
- A training session can have at most one completion record.
- Clients cannot supply completion IDs or timestamps.

## API endpoints

| Method | Route | Behaviour |
| --- | --- | --- |
| `GET` | `/api/training-sessions/{sessionId}/completion` | Returns 200, or 404 for a missing session/completion |
| `POST` | `/api/training-sessions/{sessionId}/completion` | Returns 201, 404 for a missing parent, or 409 when already recorded |
| `PUT` | `/api/training-sessions/{sessionId}/completion` | Updates an existing completion and preserves its creation timestamp |
| `DELETE` | `/api/training-sessions/{sessionId}/completion` | Deletes only the completion and returns 204 |

Malformed IDs return 400 rather than reaching MongoDB.

## Frontend workflow

The planned-session detail page always remains visible and includes a distinct **Completed session** section. An empty state links to `/sessions/:id/complete`. That route creates a completion when none exists and edits the existing record otherwise. The form has separate ratings, dynamic repetition results, and reflection sections. Completion deletion has its own explicit confirmation that states the planned session will remain.

## MongoDB collection and index

Completed outcomes use the `sessionCompletions` collection. The repository idempotently creates a unique ascending index named `ux_sessionCompletions_trainingSessionId` on `TrainingSessionId`. The unique index is the persistence-level safeguard against duplicate completion records.

## Status and deletion behaviour

After a completion is successfully created, the parent `TrainingSession.Status` becomes `Completed`. Editing keeps that status.

Deleting a completion does not change the parent status and never deletes the parent training session. The previous session status is not known reliably, so automatically changing it to `Planned` could be incorrect.

## Cross-collection trade-off

Completion creation and the parent status update are sequential writes to separate collections. Milestone 3 intentionally does not introduce MongoDB transactions. A failure between those writes can leave a stored completion while the parent status has not yet changed. The unique index prevents duplicate completion creation, and later operational work can add reconciliation if real usage demonstrates the need.

## Explicitly deferred

- Confidence analytics, charts, trends, or dashboard features
- Authentication, users, athletes, coaches, or authorisation
- Gamification, XP, levels, achievements, and streaks
- Personal-best tracking and performance recommendations
- AI-generated feedback, explanations, or encouragement
- Coach messaging, notifications, and real-time features
