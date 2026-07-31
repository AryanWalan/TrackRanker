# Zustand shared application state

## Purpose

TrackRanker now has client-owned state that should survive route navigation and browser refreshes. Zustand was selected because its small typed API and persistence middleware fit the application's scale without adding Redux-style ceremony or turning client state into a second backend.

## State boundaries

Zustand owns:

- The unfinished new-session draft
- Training-session type and status filters
- The Confidence page session-type filter

The API remains the source of truth for training sessions, completions, confidence history, progress, health, loading states, and errors. Temporary interaction state—such as disclosure state and delete/clear confirmations—continues to use local React state.

## New-session draft

Normal `/sessions/new` entry restores a saved draft when present and shows a concise `Draft restored` status. Changes from the existing controlled `SessionForm` are passed to the create-page container, which updates Zustand automatically. Canceling or navigating away does not clear the draft.

Clearing a draft requires an accessible inline confirmation. Successful creation clears it before navigation so a completed submission is not restored later.

Editing `/sessions/:id/edit` remains isolated: API-loaded edit values neither read nor update the new-session draft.

Repeat Session takes deliberate precedence. `/sessions/new?copy={id}` loads planned values from the source, resets date/status/title as previously specified, and replaces any unrelated saved draft rather than merging with it.

## Shared filters

The Sessions page filters the already-loaded API response by controlled session type and status. Both filters can be combined, cleared together, and distinguish a filtered-empty result from a genuinely empty database.

The Confidence page continues to load `GET /api/confidence/history`; only its selected type filter moved to Zustand. It can be cleared independently.

## Persistence and safety

Zustand persist middleware stores a minimal versioned workspace under `trackranker-workspace` in localStorage. Only draft and filter values are serialized.

Hydration validates controlled enum values, nullable strings, intensity range, status, and the complete draft shape. Unknown filters return to `All`, while malformed drafts are discarded. A lightweight migration path allows older state to pass through the same validation rather than crashing the app.

No API responses, credentials, tokens, completion reflections, confidence records, XP, ranks, achievements, or secrets are persisted.

## Accessibility and responsive behavior

Filters use labelled native selects. Filter and draft reset actions use meaningful text, and draft clearing uses a keyboard-accessible alert dialog. Restored state is announced textually. Controls stack at the existing mobile breakpoint and remain usable around 390px.

## Testing

Dedicated store tests cover defaults, actions, reset behavior, persistence, rehydration, and invalid-state fallback. Page tests cover draft lifecycle, edit isolation, Repeat precedence, combined session filtering, route persistence, and confidence-filter persistence/reset.

## Deferred

Server-state caching, optimistic updates, offline synchronization, Redux, React Query, authentication, Cypress, rate limiting, theme state, and broad application reset UI remain deferred.
