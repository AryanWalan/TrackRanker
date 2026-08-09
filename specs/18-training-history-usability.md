# Milestone 18: Training History usability

## Usability problem

Training History displayed the correct session data, but its large heading, broad filter container, and passive cards made the page feel closer to a database listing than an athlete's useful record. Athletes needed to work too hard to answer what the session was, when it occurred, whether it was planned or completed, and what they could do next.

This milestone changes only the frontend presentation. Session CRUD, API calls, persistence, completion logging, Repeat Session, TrackRank, Confidence, and Progress behaviour remain unchanged.

## Athlete scanning priorities

The page now supports this reading order:

1. Status and date establish whether the session is upcoming work or completed evidence and when it belongs in the training timeline.
2. The athlete-authored title identifies the session.
3. Session type provides secondary categorisation.
4. Prescription receives a dedicated, high-contrast region because it is the training content athletes are most likely to recognise.
5. Planned intensity remains visible in a compact label/value treatment.
6. Explicit actions explain what is possible next.

Prescription content wraps and preserves whitespace without rewriting stored athlete text. A value such as `3 x 150m` remains exactly that value.

## Page hierarchy

The Training eyebrow, Training history `h1`, supporting description, and Log a session action remain. The history-specific heading scale and surrounding space are reduced so useful filters and sessions enter the viewport sooner while preserving TrackRanker's typography. The heading and action stack at narrow widths.

## Filter redesign

Status is presented as visible, compact buttons for All and every supported status. The active button has `aria-pressed=true`, a check mark, a stronger border, and a contrasting surface, so selection does not rely on colour alone. Type remains a labelled dropdown with the clearer default text All types.

Both controls continue to read from and write to the existing Zustand `sessionStatusFilter` and `sessionTypeFilter`. The result count uses singular/plural wording and an accessible live status. Clear filters appears only when at least one persistent filter is active and calls the existing combined reset action.

## Card information and action hierarchy

Cards retain status, date, athlete-authored title, session type, prescription, and intended intensity from the existing list response. They do not fetch or display unrelated fields.

- Planned sessions prioritise **Complete session**, with **Edit** as the secondary action.
- Completed sessions prioritise **View session**, with **Repeat** as the secondary action.
- Cancelled sessions retain useful access through **View session** and **Repeat** rather than appearing disabled.

All actions use existing routes. The article itself is not clickable, which avoids nested interactive controls and gives each action a clear accessible name. Completed sessions remain visually active because they are valuable training evidence, not dead or archived records.

## Empty-state strategy

The page distinguishes two situations:

- With no stored sessions, it explains that the athlete can start building history and provides Log a session.
- When active filters hide existing sessions, it explains that no sessions match, suggests changing type or status, and provides Clear filters.

The first-time message is never used for a filtered result set.

## Avoiding per-card completion requests

The training-session list response does not include difficulty, confidence, or reflection summaries. This milestone deliberately does not request each session's completion merely to decorate its card. The page continues to make one list request, avoiding an N+1 request pattern and keeping the polish independent of additional backend work.

## Responsive behaviour

Desktop retains the two-column card grid while the toolbar sizes to its contents instead of stretching across the page. At 700px and below, the header action, toolbar, and cards use the full available width; cards stack into one column, status controls wrap, and action buttons retain tap-friendly height. Long titles and prescriptions use safe wrapping, and no fixed card width introduces horizontal overflow around 390px.

## Accessibility decisions

- Training history remains the single page `h1`.
- Status controls sit in a labelled fieldset and expose their selected state with `aria-pressed`.
- Type retains an explicit label.
- Session count is announced as a live status with correct singular/plural text.
- Status is written as text and is not communicated by colour alone.
- Each card action is a labelled link with the existing global visible focus treatment.
- True-empty and filtered-empty actions remain keyboard accessible.
