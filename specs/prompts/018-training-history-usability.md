You are implementing a focused UX polish milestone for TrackRanker.

Milestone 18: Training History Usability.

IMPORTANT:
- Do NOT run git add.
- Do NOT commit.
- Do NOT push.
- I will stage and commit manually.
- Prefer frontend-only changes.
- Do not change session CRUD behaviour.
- Do not add unrelated features.
- Do not change TrackRank, Confidence, Cypress, security, or EF Core behaviour.

# Current problem

The Training History page is visually clean, but it still feels more like a database
listing than an athlete-friendly training history.

The page should help the athlete understand three things quickly:

1. What did I do?
2. When did I do it?
3. What can I do with this session now?

Current page structure includes:

- large "Training history" heading
- Type dropdown
- Status dropdown
- session count
- session cards
- Log a session action

Current cards include:

- status
- date
- title
- session type
- prescription
- intended intensity

The goal is NOT to redesign the whole Sessions area.

The goal is to make Training History easier to scan and act on.

# 1. Improve page header hierarchy

Keep:

Eyebrow:
"Training"

Heading:
"Training history"

Supporting text:
"View, repeat, and manage the sessions you have already logged."

Keep the existing Log a session action.

However:

- reduce the oversized heading slightly
- reduce unnecessary empty vertical space
- bring the useful session content higher on the page
- preserve the strong TrackRanker typography
- keep the desktop page spacious without making the heading dominate the viewport

On mobile, ensure the heading and Log a session action stack naturally.

# 2. Simplify the filter area

The current filter container uses too much horizontal space for two controls.

Improve it into a compact training-history toolbar.

Use:

## Status

Make status easier to change quickly.

Prefer simple visible status controls such as:

All
Planned
Completed

These may be segmented buttons/tabs/chips if consistent with the current design.

The selected status must be obvious without relying only on colour.

Continue using the existing Zustand session-status filter state.

Do not create a second competing state system.

## Type

Keep Session Type as a dropdown.

Label:
"Type"

Default:
"All types"

Use the existing Zustand type filter.

## Count

Keep the result count visible, e.g.:

"2 sessions"

Use correct singular/plural:

"1 session"
"2 sessions"

When filters are active and there are no matches, use a useful filtered empty state.

If appropriate, provide:

"Clear filters"

only when filters are active.

Do not add search in this milestone.

# 3. Improve session card information hierarchy

Make each card easy to scan.

Recommended order:

STATUS                                      DATE

SESSION TITLE

SESSION TYPE

PRESCRIPTION

PLANNED INTENSITY

ACTIONS

Do not display every possible session field.

## Status

Preserve the existing status badge.

Completed and Planned should be visually distinct.

Do not use colour as the only distinction.

## Date

Keep date visible but secondary.

Use a concise readable date format consistent with the rest of TrackRanker.

## Title

Keep the session title prominent.

Do not automatically rewrite or rename athlete-entered titles.

## Session type

Keep the session type visible, but clearly secondary to the title.

## Prescription

Make the prescription visually important.

This is one of the main things athletes recognise when looking back at training.

Allow longer prescriptions to wrap naturally.

Do NOT modify stored prescription text just for formatting.

For example, if an athlete entered:

3 x 150m

do not silently mutate the database value to:

3 × 150m

Any visual formatting must not alter athlete-authored content.

## Intended intensity

Present more compactly.

Example:

Planned intensity
87%

Do not make it compete with the prescription or title.

# 4. Add clear card actions

The current cards do not clearly communicate what the athlete can do next.

Add a small action area to each card.

For COMPLETED sessions:

Primary:
"View session"

Secondary:
"Repeat"

Use existing routes/functionality.

For PLANNED sessions:

Primary:
"Complete session"

Secondary:
"Edit"

Use existing routes/functionality.

If Repeat Session is already implemented, reuse it.

Do not rebuild Repeat Session.

Do not create new backend endpoints.

Do not create actions that current application behaviour cannot support.

Make actions obvious with keyboard focus states.

Do not rely on clicking an unlabelled card.

If making the whole card clickable introduces nested interactive-element problems,
keep the card itself non-clickable and use explicit actions instead.

# 5. Completed vs planned usefulness

Completed and Planned cards should feel slightly different in purpose.

Planned:
"What do I need to do?"

Completed:
"What did I do / what can I review?"

Do this through action hierarchy and status treatment rather than a major redesign.

Do not make completed cards visually disabled.

Completed sessions are valuable training evidence, not archived/dead records.

# 6. Avoid N+1 completion API requests

Do NOT fetch a SessionCompletion individually for every card just to add extra metrics.

If the existing training-session list response does not contain:

- difficulty
- confidence
- reflection status

do not add them to cards in this milestone.

Avoid introducing:

1 sessions request
+ N completion requests

just for visual polish.

The card should remain useful using the data already available.

If completion summary data is already available without additional requests, it may be
used carefully.

# 7. Filtered and empty states

Improve empty-state wording.

## No sessions at all

Heading:
"No sessions logged yet"

Supporting text:
"Log your first training session to start building your training history."

Action:
"Log a session"

## Filters produce no matches

Heading:
"No sessions match these filters"

Supporting text:
"Try changing the session type or status."

Action:
"Clear filters"

Do not show the first-time empty state when sessions exist but filters hide them.

# 8. Responsive design

Test around:

- 390px mobile
- tablet
- normal desktop
- wide desktop

Desktop:
- cards may remain in a two-column grid
- toolbar should not stretch awkwardly across the page

Mobile:
- cards stack
- action buttons remain easy to tap
- status controls wrap cleanly
- filter controls do not cause horizontal overflow
- title/prescription do not overflow
- date/status layout remains readable

# 9. Accessibility

Ensure:

- one h1 for Training history
- form controls have labels
- selected status control exposes its selected/current state
- card actions have meaningful accessible names
- visible focus states remain
- colour is not the only status indicator
- empty-state actions are accessible
- session count remains understandable to screen readers

# 10. Preserve existing Zustand behaviour

Do not remove persistent filters.

Existing Zustand behaviour should continue to support:

- session type filter
- session status filter
- persistence where currently implemented
- reset/clear behaviour

Update store integration only if required by the new status-control presentation.

Do not move server/API session data into Zustand.

# 11. Preserve existing behaviour

Do not break:

- session creation
- session editing
- session deletion
- session detail page
- completion logging
- Repeat Session
- Zustand session draft
- Zustand filters
- Dashboard Recent Training
- Confidence
- Progress
- Cypress workflows
- rate limiting
- EF Core persistence

# Testing

Update/add focused frontend tests.

Cover at minimum:

1. Training history heading renders.
2. Supporting description renders.
3. Log a session links to /sessions/new.
4. Session count uses correct singular/plural.
5. Status choices include All, Planned, Completed.
6. Selecting Planned filters sessions.
7. Selecting Completed filters sessions.
8. Type filter still works.
9. Zustand-backed filters remain integrated.
10. Clear filters appears only when useful.
11. No-session empty state renders correctly.
12. Filtered empty state is distinct from true empty state.
13. Completed session exposes:
    - View session
    - Repeat
14. Planned session exposes:
    - Complete session
    - Edit
15. Actions route correctly.
16. Prescription remains visible.
17. Intended intensity remains visible.
18. Existing session card data is preserved.
19. No Profile navigation is reintroduced.
20. Existing useful Sessions tests continue passing.

Do not mock new APIs that do not exist.

# Cypress

Do not expand the Cypress suite unless an existing selector is broken by this UI change.

After implementation, run the existing Cypress suite once if practical to confirm the
new card actions and filters have not broken critical workflows.

Do not make Cypress the main focus of this milestone.

# Documentation

Create:

specs/18-training-history-usability.md

Document:

- usability problem
- athlete scanning priorities
- page hierarchy
- filter redesign
- card information hierarchy
- Planned vs Completed action hierarchy
- empty-state strategy
- why completion metrics were not fetched per card
- responsive behaviour
- accessibility decisions

Create:

specs/decisions/012-training-history-card-hierarchy.md

Document:

Context:
Training History displayed correct data but did not clearly communicate what an athlete
should notice or do next.

Decision:
Prioritise session identity, prescription, status, date and status-specific actions.

Explain:

- why prescription is prominent
- why explicit card actions are preferred
- why Planned and Completed sessions have different actions
- why completed sessions remain active training evidence
- why status becomes a quick filter
- why Type remains a dropdown
- why per-card completion fetching was avoided

# Prompt evidence

Create:

specs/prompts/018-training-history-usability.md

Copy this COMPLETE prompt into the file exactly.

Do not modify previous prompt evidence.

# README

Do not make major README changes.

Only mention the Training History usability improvement if there is a natural existing
feature description where it adds value.

Do not change advanced-requirement status.

# Verification

Run:

npm test
npm run build

If practical, run the existing Cypress suite once.

Also run:

git diff --check
git status

Perform:

- prompt-integrity check
- generated-file scan
- secret scan

Do NOT stage.
Do NOT commit.
Do NOT push.

# Manual verification

Inspect Training History at desktop and approximately 390px mobile width.

Confirm:

1. Heading no longer overwhelms the page.
2. Filters are compact and understandable.
3. Status can be changed quickly.
4. Session count is clear.
5. Cards are easy to scan.
6. Prescription is visually meaningful.
7. Completed actions are obvious.
8. Planned actions are obvious.
9. Filters persist correctly.
10. True empty and filtered-empty states are different.
11. No horizontal overflow.
12. Keyboard focus is visible.

# Success criterion

An athlete should be able to look at Training History and understand within a few
seconds:

"What session was this?"
"When did I do it?"
"Was it planned or completed?"
"What did the session contain?"
"What can I do with it now?"

Prefer clarity over adding more information.

# Final response

Report:

1. UX problem addressed.
2. Header changes.
3. Filter changes.
4. Session-card hierarchy.
5. Planned vs Completed actions.
6. Empty-state changes.
7. Zustand integration.
8. Responsive changes.
9. Accessibility improvements.
10. Tests changed.
11. Exact test/build results.
12. Cypress regression result if run.
13. Files modified/created.
14. Any remaining UX concerns.
15. git status.

IMPORTANT:
Do NOT stage.
Do NOT commit.
Do NOT push.
