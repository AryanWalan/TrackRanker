# Repeat a previous session

## User problem

Sprint athletes often repeat similar prescribed workouts. Re-entering the session type, prescription, intended intensity, and clarity wording makes routine session planning unnecessarily slow.

## Workflow

The session detail page provides a secondary **Repeat session** link to `/sessions/new?copy={sessionId}`. The query parameter survives refresh and the normal `/sessions/new` route remains unchanged.

The create page intentionally waits while it loads the source through the existing typed API. It then mounts the existing `SessionForm` with editable initial values and a concise source-session message.

## Copied and reset fields

The new session copies:

- Session type
- Prescription
- Intended intensity
- Purpose
- Focus cue
- Success criteria
- Coach notes

Its date is reset to today's local calendar date, status is reset to `Planned`, and title is left blank so existing automatic title generation remains consistent. Source identifiers, timestamps, status, and all completion data are excluded.

Completed-session results, reflections, confidence values, XP, ranks, and achievements are never copied because a repeated plan is independent training work, not evidence that the athlete completed it.

## API and fallback

Creation continues to use `POST /api/training-sessions`; no repeat endpoint or backend changes are needed. If the source ID is invalid or loading fails, a safe message offers blank session creation or navigation back to the session list without exposing the API error.

## Deferred

Stored templates, favourites, workout libraries, recurring schedules, bulk creation, and progression recommendations remain out of scope.
