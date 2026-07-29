# Dashboard recent training

## Purpose

The Dashboard gives athletes an immediate route into logging or reviewing training and a compact snapshot of recent sessions.

## Behaviour

- **Log a session** links to `/sessions/new`.
- **View training** links to `/sessions`.
- Recent training reuses `getTrainingSessions()`, sorts safely by `SessionDate`, and displays at most the newest three sessions.
- Each compact item shows title, type, date, prescription, and status and links to its session detail page.
- Loading is presented as an intentional status panel.
- The empty state invites the athlete to log their first session.
- A fetch failure leaves both quick actions usable and shows concise, non-technical copy.
- Backend connection status remains available as visually secondary system information.

## API reuse

No dashboard endpoint or duplicate request logic is introduced. The existing typed training-session API already supplies the small dataset needed for this client-side summary.

## Explicitly deferred

Confidence analytics, charts, gamification, achievements, authentication, personal bests, recommendations, AI features, and new backend functionality remain outside this focused improvement.

