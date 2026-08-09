# ADR 012: Training History card hierarchy

## Status

Accepted.

## Context

Training History displayed correct data but did not clearly communicate what an athlete should notice or do next. The cards treated status, identity, prescription, intensity, and navigation with similar weight, while the filter area devoted substantial space to two dropdowns.

The list endpoint already provides the data needed for a useful history card. Completion-specific difficulty, confidence, and reflection information would require an additional request per session.

## Decision

Prioritise session identity, prescription, status, date, and status-specific actions.

Prescription is prominent because it is the most recognisable description of the work prescribed by the athlete's coach. It remains athlete-authored text: wrapping and visual treatment may change, but stored characters and wording are never normalised for display.

Cards use explicit actions instead of relying on an unlabelled clickable surface. This gives keyboard and screen-reader users clear destinations and avoids invalid nested interactions.

Planned and Completed sessions have different action priorities because they answer different athlete needs:

- Planned sessions lead to Complete session and offer Edit.
- Completed sessions lead to View session and offer Repeat.

Completed sessions remain visually active. They are evidence athletes can review and reuse, not archived records to deemphasise as unavailable.

Status becomes a quick visible filter because it is a small, frequently changed set and directly answers whether the athlete is looking for upcoming or completed work. Type remains a dropdown because it has more choices, is secondary to status, and is more compact in that form. Both presentations continue to use the existing persisted Zustand filters.

Per-card completion fetching is avoided. Difficulty, confidence, and reflection summaries are omitted rather than creating one list request plus N completion requests for visual polish.

## Consequences

- Athletes can scan session purpose and next actions more quickly.
- Planned and Completed cards communicate different uses without separate components or backend changes.
- Status selection is visible and accessible without relying only on colour.
- Cards remain limited to list-response data, so completion metrics are available on detail and evidence pages rather than Training History.
- Existing session routes, CRUD behaviour, and Zustand persistence remain authoritative.
