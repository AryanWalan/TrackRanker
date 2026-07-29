# Training sessions

## Purpose

Training sessions are TrackRanker's first complete product feature. They preserve both the work prescribed by a coach and the clarity an athlete needs around why it matters, what to focus on, and what successful execution looks like. This feature records instructions; it does not judge coaching decisions or generate advice.

## TrainingSession fields

| Field | Description |
| --- | --- |
| `Id` | MongoDB ObjectId exposed through the API as a string |
| `Title` | Short session name |
| `SessionType` | Controlled sprint-training category |
| `SessionDate` | Calendar date of the session |
| `Prescription` | Repetitions, distances, recovery, sets, and other prescribed work |
| `Purpose` | Optional intended adaptation or skill |
| `FocusCue` | Optional execution cue |
| `SuccessCriteria` | Optional description of successful completion |
| `IntendedIntensity` | Optional percentage effort from 0 to 100 |
| `CoachNotes` | Optional notes supplied by the coach |
| `Status` | Planned, completed, or cancelled |
| `CreatedAtUtc` | Backend-controlled creation timestamp |
| `UpdatedAtUtc` | Backend-controlled modification timestamp |

## SessionType values

- `Acceleration`
- `MaxVelocity`
- `SpeedEndurance`
- `SpecialEndurance`
- `Tempo`
- `Starts`
- `Competition`
- `Recovery`
- `Other`

## Status values

- `Planned` — the default for a new session
- `Completed`
- `Cancelled`

## Validation rules

- Title is required, trimmed, and limited to 100 characters.
- Session date is required.
- Prescription is required, trimmed, and limited to 1,000 characters.
- Purpose and coach notes are each limited to 1,000 characters.
- Focus cue and success criteria are each limited to 500 characters.
- Intended intensity is optional and must be an integer from 0 through 100.
- Session type and status must be recognised controlled values.
- IDs and timestamps are backend-controlled; clients cannot set them through create or update requests.

## API endpoints

| Method | Route | Result |
| --- | --- | --- |
| `GET` | `/api/training-sessions` | Sessions sorted by session date descending |
| `GET` | `/api/training-sessions/{id}` | One session, 404 when absent, or 400 for a malformed ID |
| `POST` | `/api/training-sessions` | Creates a session and returns 201 with the new resource |
| `PUT` | `/api/training-sessions/{id}` | Replaces editable fields and returns the updated session |
| `DELETE` | `/api/training-sessions/{id}` | Deletes a session and returns 204 |

MongoDB persists these records in the `trainingSessions` collection.

## Main frontend flow

1. The athlete opens `/sessions` to see session cards or a useful empty state.
2. They choose **Add Session**, complete the clarity-focused form, and submit it.
3. Successful creation navigates to `/sessions/:id`.
4. The detail page groups the prescription, purpose, focus, success criteria, and notes.
5. The athlete can open `/sessions/:id/edit` to change editable fields.
6. Delete requires a separate confirmation action and returns the athlete to the session list.

## Explicitly deferred

- Authentication, athlete and coach accounts
- Confidence scores and post-session reflection
- Repetition times, results, and performance calculations
- Personal bests and dashboard analytics
- XP, levels, achievements, badges, and streaks
- AI-generated explanations or training advice
- Notifications and rate limiting
