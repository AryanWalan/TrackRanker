# Streamlined session creation

## Motivation

Athlete feedback described the original session form as feeling like a “job application”: long, visually flat, and too demanding for a workout that the athlete already understood. Every field appeared equally important even though only a few values are needed to record the prescribed work.

## Progressive disclosure

Milestone 4 keeps one create/edit flow and prioritises fast workout logging. The initial form presents the essentials, while a keyboard-accessible **Add more clarity** disclosure reveals deeper context only when the athlete wants it. This supports both quick logging and training clarity without creating separate modes or a multi-step wizard.

## Essential fields

- Session type
- Date
- Prescription, labelled **What's the session?**
- Planned intensity, required from 0 through 100 percent

Status and optional custom title remain visually secondary so existing create/edit capability is preserved.

## Optional clarity

The collapsed clarity section contains:

- Purpose
- Focus cue
- Success criteria
- Coach notes

It starts collapsed for creation. During editing, it starts expanded whenever any clarity value exists, ensuring stored information is neither hidden nor lost.

## Session title decision

Custom title remains available as an optional secondary field. The internal model and API response continue to contain a non-null title for compatibility. When the request title is blank, the backend generates:

`Readable Session Type — Trimmed Prescription`

For example, `Max Velocity — 5 × 30m Fly`. Generation does not parse workout structure and safely truncates the result to 100 characters. Manual titles are preserved.

## Sprint clarity presets

Static frontend templates are provided for existing `Acceleration`, `MaxVelocity`, `SpeedEndurance`, `Tempo`, and `Competition` session types. **Use suggested clarity** fills only empty purpose, focus cue, and success criteria fields:

- Athlete-entered text is never overwritten.
- Coach notes are never populated.
- Changing session type never changes existing clarity.
- All suggested text remains editable.
- Suggestions are TrackRanker templates, not AI output or coaching prescriptions.

## Validation changes

The backend now genuinely requires session type, session date, prescription, and intended intensity. Request titles are optional. Clarity fields remain optional with their existing maximum lengths. Validation continues at the API and service boundaries.

The persisted `TrainingSession.IntendedIntensity` property remains nullable so older MongoDB documents still deserialize without a destructive migration. New and updated API requests must provide it.

## Accessibility

- Every field has a programmatic label.
- Required fields are identified in text as well as by browser semantics.
- The clarity control is a native button with `aria-expanded` and `aria-controls`.
- All selection controls work with keyboard and screen readers.
- Visible focus states remain in the shared stylesheet.
- Helper and validation text provides meaning without relying on colour.

## Backwards compatibility

All existing CRUD endpoints and response shapes remain unchanged. Fully populated clients continue to work, legacy stored sessions remain readable, and manually entered titles are retained. No migration or destructive data rewrite is performed.

## Explicitly deferred

- Workout parsing or structured workout builders
- AI-generated explanations or recommendations
- Confidence history, analytics, charts, or trends
- Authentication, users, coaches, and authorisation
- Gamification, XP, levels, achievements, and streaks
- Calendar scheduling, drag-and-drop, and deployment changes
