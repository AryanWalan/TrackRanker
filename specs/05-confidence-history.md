# Confidence history

## Purpose

Milestone 5 turns completed training into an evidence-based confidence history. It helps an athlete revisit how they felt before and after sessions and the specific reflection or coach feedback they recorded, without generating motivation, diagnosis, or training advice.

## Existing completion data

Confidence history derives from `TrainingSession`, `SessionCompletion`, and its embedded `SessionReflection`. No confidence collection or duplicate confidence record is introduced. The read service joins completion evidence to its parent session so API consumers receive the title, controlled type, and session date alongside reflection data.

## Summary calculations

- `TotalReflectedSessions` counts joined completions with at least one confidence value or non-blank reflection field.
- `SessionsWithConfidence` counts entries with both before and after ratings.
- `SessionsImproved` counts only paired ratings where after is strictly greater than before. Equal and lower values remain legitimate evidence.
- Before and after averages are calculated independently over available values and rounded to one decimal place.
- An unavailable average is `null`, never zero or an invented value.

## Inclusion and missing data

A completion is included when it has a before or after confidence value, or meaningful text in `WentWell`, `Improved`, `WasDifficult`, `NextFocus`, or `CoachFeedback`. A completion with none of these is excluded. Orphaned completions without a matching session are excluded because the evidence cannot be linked back to its source session.

Partial confidence is retained. A delta is shown only when both ratings exist. Reflection-only entries remain visible, with concise guidance that comparisons will appear once paired ratings are logged.

## Ordering and filtering

The API returns newest session date first, with training-session ID as a stable descending tie-break. The page filters client-side using only the existing controlled session types. No search, date range, backend filter, or additional route is introduced.

## Visualisation

One responsive native SVG plots confidence before and after over time on the stored 1–5 scale. This avoids adding a chart dependency for a small dataset. Before uses circles and a dashed dark line; after uses squares and a solid track-red line, so meaning does not depend on colour alone. Missing values are omitted rather than interpolated or manufactured.

## Accessibility

The chart is labelled as an image and has a textual, session-by-session description. Its legend uses labels plus different shapes and line styles. Semantic headings, definition lists, labelled native select filtering, readable dates, visible focus states, descriptive session links, touch-sized controls, and wrapping reflection text support keyboard, mobile, and screen-reader use.

## Empty state and language

An empty history returns HTTP 200 with zero counts, null averages, and no entries. The page directs the athlete to existing sessions without shame and never renders a zero-filled chart. Copy reports stored facts such as higher post-session ratings and previous reflections; it does not infer psychological improvement or promise performance.

## Explicitly deferred

- Gamification, XP, levels, achievements, badges, and streaks
- Authentication, athlete profiles, coach accounts, and messaging
- AI encouragement, analysis, recommendations, or psychological assessment
- Confidence goals, notifications, race predictions, and personal-best tracking
- Advanced search, date filtering, multiple charts, and dashboard analytics

