You are implementing a major TrackRanker milestone.

Milestone 10: Zustand-powered shared application state and persistent athlete workspace.

IMPORTANT:
- Do NOT run git add.
- Do NOT create a git commit.
- Do NOT push.
- I will stage and commit manually.
- This is a substantial milestone, but do not make unrelated architectural changes.
- Keep server data in the API layer rather than turning Zustand into an API cache.

Before making changes:

1. Read AGENTS.md.
2. Read README.md.
3. Read all current /specs documents.
4. Review all existing frontend routes and components.
5. Review:
   - TrainingSessionForm
   - session create/edit pages
   - Repeat Session functionality if currently implemented
   - Sessions page
   - Confidence page
   - Dashboard
   - Progress page
   - API services
6. Review all existing frontend tests.
7. Review package.json and current frontend dependencies.
8. Preserve all previous /specs/prompts files unchanged.

# Project context

TrackRanker is a training-clarity, confidence and process-gamification application
for 100m, 200m and 400m sprinters.

Current functionality includes:

- Training session CRUD.
- Streamlined session creation.
- Optional session clarity.
- Session completion and repetition results.
- Structured post-session reflection.
- Confidence before and after sessions.
- Evidence-based Confidence history.
- Recent-training Dashboard.
- TrackRank XP and achievements.
- Immediate progress feedback after session logging, if currently implemented.
- Repeat Session, if currently implemented.
- MongoDB persistence.
- React + TypeScript frontend.
- C# .NET 10 backend.
- Scalar API documentation.
- Frontend and backend automated tests.

# Assessment context

One of TrackRanker's selected advanced requirements is:

Use a state management library.

Implement Zustand as a meaningful architectural feature.

Do not install Redux or another competing state library.

TrackRanker's three intended marked advanced requirements are:

1. Security Measures
   - Data validation / sanitisation
   - Rate limiting

2. Zustand State Management

3. Cypress End-to-End Testing

README.md must clearly identify these three as the selected advanced requirements.

For this milestone:
- Zustand becomes IMPLEMENTED.
- Security remains partial/planned unless already fully implemented.
- Cypress remains planned.

Do not claim unfinished advanced requirements are complete.

# Main goal

Introduce Zustand for genuinely shared client-side UI state.

Use it to improve the TrackRanker user experience in three areas:

1. Persistent new-session draft.
2. Shared session-list filtering.
3. Persistent confidence-history filtering.

Do NOT move API/server data into Zustand.

Training sessions, confidence history, progress and completions should continue to
come from the existing API.

Zustand should manage CLIENT STATE, not become a replacement for the backend.

# Dependency

Add:

zustand

Use the current stable package version compatible with the project.

Use Zustand's persist middleware where useful.

Do not add another state-management package.

# Store architecture

Create a clear store structure.

Prefer either:

frontend/src/stores/useTrackRankerStore.ts

or a small set of focused stores if that better matches the existing architecture.

Do not create excessive stores.

A reasonable structure is:

useTrackRankerStore

containing slices/concepts for:

- new-session draft
- session filters
- confidence filter

Keep actions explicit and typed.

# 1. Persistent new-session draft

This is the most important use of Zustand in this milestone.

Problem:

An athlete may begin entering a session at the track and accidentally:

- refresh the page
- navigate away
- close/reopen the browser

They should not automatically lose an unfinished NEW session.

Use Zustand persistence to maintain the draft in localStorage.

# Draft contents

Store only fields relevant to creating a new TrainingSession.

For example:

- SessionType
- SessionDate
- Prescription
- IntendedIntensity
- Title/custom title if applicable
- Purpose
- FocusCue
- SuccessCriteria
- CoachNotes

Match the actual current form model.

Do not invent fields that do not exist.

# Draft rules

The store should support actions conceptually similar to:

setSessionDraftField(...)
setSessionDraft(...)
clearSessionDraft()
hasSessionDraft()

Exact API may differ if a cleaner typed design exists.

# Create form integration

When using the NORMAL:

/sessions/new

route:

If a saved draft exists, initialise the form from that draft.

As the athlete changes form values:

update the Zustand draft.

Do not require a manual "Save draft" button.

# Draft persistence

Persist the draft using Zustand persist middleware.

Use a clearly namespaced localStorage key such as:

trackranker-session-draft

or a store-level TrackRanker key.

Do not store secrets.

Do not store API responses.

Do not persist completed-session reflection or confidence information.

# Draft indication

If a restored draft exists, show a subtle message such as:

"Draft restored"

Keep this concise.

Do not display a large modal.

# Clear draft

Provide an intentional way to discard the draft.

Use wording such as:

"Clear draft"

Require a lightweight confirmation if clearing substantial entered content.

Do not make clearing the draft too easy accidentally.

# Successful creation

After a training session is successfully created:

clear the stored new-session draft.

The athlete should not return to /sessions/new later and find the already-created
session still present as a draft.

# Cancel/navigation behaviour

Navigating away from the create page should NOT automatically clear the draft.

That is the point of persistence.

# Edit mode

Editing:

/sessions/:id/edit

must NOT use or overwrite the new-session draft.

This is critical.

The draft exists only for creating a NEW training session.

Editing an existing session should continue to use API-loaded session data.

Do not save edit-form changes into the create-session draft.

# Repeat Session integration

If Repeat Session is currently implemented:

A deliberate Repeat Session action must initialise the new-session form using the
source session rather than silently mixing it with an unrelated saved draft.

Preferred behaviour:

1. Athlete chooses Repeat Session.
2. Source session values become the active create form values.
3. Those values become the new draft.
4. Any previous unrelated new-session draft is replaced.

Do not merge old draft values with repeated-session values.

The deliberate Repeat action should take precedence.

If Repeat Session has NOT yet been implemented in the current repository:
do not implement it solely for this milestone.

# Form implementation

Reuse the existing TrainingSessionForm.

Do not create a separate Zustand-specific form.

Keep normal controlled form behaviour if currently used.

Integrate Zustand cleanly without requiring every small presentational component to
directly access the global store.

Prefer keeping store interactions near page/container boundaries.

# 2. Sessions page filtering

Improve the existing Sessions page with lightweight filters.

The goal is both useful UX and a meaningful example of shared client state.

Add filters using values already supported by TrackRanker.

At minimum:

Session type:
- All
- each existing controlled session type

Status:
- All
- each existing controlled session status

Do not invent new backend enum values.

# Filter behaviour

Filtering should be client-side using the sessions already returned by the existing API.

Do not create new backend filtering endpoints for this milestone.

Store selected filters in Zustand.

When the athlete:

Sessions
→ opens a session
→ returns to Sessions

their selected filters should still be present.

Persist the filters to localStorage so they survive refresh.

# Session filter store values

Conceptually:

sessionTypeFilter
sessionStatusFilter

with actions:

setSessionTypeFilter(...)
setSessionStatusFilter(...)
resetSessionFilters()

Use actual current TypeScript types where possible.

Avoid uncontrolled arbitrary strings.

# Filter UI

Keep it compact.

Do not turn the Sessions page into an analytics interface.

Add:

Type
[All]

Status
[All]

and a:

Clear filters

action when filters are active.

# Filtered empty state

If training sessions exist but none match the filters:

Do NOT show:

"No sessions logged yet."

Instead show something like:

"No sessions match these filters."

Provide:

"Clear filters"

The true empty database state should remain distinct.

# Session counts

If visually appropriate, show a concise result count such as:

4 sessions

Do not add unnecessary statistics.

# 3. Confidence-history filter

The Confidence page already supports filtering by session type.

Move this filter state into Zustand.

Do not rewrite Confidence data loading.

Continue using:

GET /api/confidence/history

as the source of history data.

# Confidence filter behaviour

The selected confidence session-type filter should:

- persist when navigating away and back
- survive refresh through Zustand persistence
- continue supporting every existing controlled session type
- continue supporting All

Do not move ConfidenceHistory API results into Zustand.

Only the FILTER belongs in the store.

# Persistence strategy

Use Zustand persist middleware.

Persist only appropriate UI state:

YES:
- new session draft
- session type filter
- session status filter
- confidence type filter

NO:
- API responses
- TrackRank totals
- confidence history data
- training session arrays
- health status
- completion records
- loading states
- API errors
- access tokens
- secrets

Document this separation.

# Store versioning

Because persisted localStorage state may evolve, use a simple store version if
Zustand persist supports it cleanly.

If necessary, provide a lightweight migration/default strategy.

Do not overengineer migrations.

The main requirement is that malformed or old persisted state should not crash
the application.

# Persisted-state safety

Handle invalid persisted values defensively.

Examples:

Unknown session type:
fall back to All/default.

Unknown session status:
fall back to All/default.

Corrupt/missing draft:
fall back to a clean draft.

Do not assume localStorage content is trusted.

# State reset behaviour

Implement clear/reset actions.

At minimum:

clearSessionDraft()
resetSessionFilters()
resetConfidenceFilter()

Optionally expose a broader reset method if it remains clean.

Do not add a visible "Reset entire application" feature.

# DevTools

Do not add Redux DevTools or extra debug packages solely for this milestone.

If Zustand devtools support is available without unnecessary complexity, it is optional,
not required.

# Frontend architecture

Keep a clean distinction:

Backend/API:
persistent application data.

Zustand:
shared/persistent client UI state.

Local component state:
temporary state only relevant to one component, such as:
- modal open state
- temporary input focus
- one-off confirmation visibility

Do not force all useState calls into Zustand.

Using local state where appropriate is good architecture.

Document this explicitly.

# No backend changes preferred

This should primarily be a frontend architectural milestone.

Do NOT alter MongoDB models.

Do NOT add endpoints.

Do NOT change TrackRank calculations.

Do NOT modify ConfidenceHistory calculations.

Do NOT change completion business rules.

Only make backend changes if required to fix a genuine compatibility issue uncovered
during implementation, and report them clearly.

# Sessions page UX

Review the Sessions page while adding filters.

Keep:

- clear hierarchy
- mobile responsiveness
- existing create-session action
- existing session cards/list
- loading state
- API error state

Do not redesign the entire page.

# Create-session UX

The draft feature should not make the already-streamlined create form feel longer.

Do not add more required fields.

Do not add a new draft-management section.

The experience should remain:

open
→ enter session
→ create

with persistence working quietly in the background.

# Mobile

Verify around 390px width.

Ensure:

- filter controls stack/wrap properly
- Clear filters remains usable
- Draft restored message wraps
- Clear draft action is touch-friendly
- no horizontal overflow
- existing form remains usable

# Accessibility

Ensure:

- filters have labels
- Clear filters has meaningful text
- restored-draft status is understandable
- Clear draft confirmation is keyboard accessible
- filter state is not communicated only through colour
- focus states remain visible
- persisted state does not interfere with normal keyboard navigation

# Tests: store

Add dedicated Zustand store tests.

Cover at minimum:

1. Default state is correct.
2. Setting session draft values updates state.
3. Clearing session draft resets it.
4. Session type filter updates.
5. Session status filter updates.
6. Session filters reset correctly.
7. Confidence filter updates.
8. Confidence filter resets.
9. Invalid persisted filter values fall back safely if migration/validation is implemented.

Reset store state between tests.

Avoid test leakage.

# Tests: create session draft

Add/update frontend tests covering:

1. New-session form updates the draft.
2. Existing draft restores into /sessions/new.
3. Draft-restored indicator appears.
4. Successful create clears the draft.
5. Navigating away does not intentionally clear draft state.
6. Clear draft resets the form appropriately.
7. Edit-session mode does not load the new-session draft.
8. Edit-session mode does not overwrite the draft.
9. Repeat Session overrides an unrelated draft, IF Repeat Session exists.

Mock APIs normally.

# Tests: Sessions filtering

Cover:

1. Default filters show all sessions.
2. Type filter shows matching sessions.
3. Status filter shows matching sessions.
4. Type + status filters work together.
5. Filtered-empty state differs from true empty state.
6. Clear filters restores all sessions.
7. Filter selection survives route navigation through shared store state.

# Tests: Confidence filtering

Update Confidence tests so:

1. Existing filtering still works.
2. Filter comes from Zustand.
3. Selected filter persists through unmount/remount where practical.
4. Reset restores All.

Do not weaken existing Confidence coverage.

# Regression expectations

All existing tests should remain passing.

Do not break:

- Dashboard
- Recent Training
- Session CRUD
- streamlined creation
- completion logging
- repetition results
- reflections
- confidence history
- TrackRank progress
- XP feedback if implemented
- Repeat Session if implemented
- health status
- responsive navigation

# Out of scope

Do NOT implement:

- Redux
- React Query / TanStack Query
- server-state caching
- optimistic API updates
- offline API synchronization
- authentication
- user accounts
- coach accounts
- multiple athletes
- dark mode
- theme switching
- Cypress
- rate limiting
- additional security features
- new XP
- new achievements
- streaks
- leaderboards
- WebSockets
- Storybook
- Dockerisation changes
- deployment changes
- browser notifications
- AI functionality
- unrelated dependency upgrades

Cypress and Security Measures are separate future milestones.

# README advanced requirements

Update README.md with a clearly visible section:

## Advanced Requirements Selected

List EXACTLY these three marked advanced requirements:

1. Security Measures
   - Data validation / sanitisation
   - Rate limiting
   - Status: partially implemented / planned as factually appropriate

2. Zustand State Management
   - Status: implemented
   - Brief explanation of draft and filter state

3. Cypress End-to-End Testing
   - Status: planned

The wording may be improved, but the three selected features must be unambiguous.

Do not list theme switching as one of the three marked features.

Do not claim Cypress or rate limiting is complete before implementation.

# Documentation

Create:

specs/10-zustand-state-management.md

Document:

- Why Zustand was selected.
- What state belongs in Zustand.
- What state deliberately does not belong in Zustand.
- New-session draft design.
- Draft persistence.
- Edit-session isolation.
- Repeat Session precedence if applicable.
- Session filter design.
- Confidence filter design.
- localStorage persistence.
- defensive persisted-state handling.
- reset behaviour.
- accessibility.
- testing.
- explicitly deferred features.

Create a design decision record:

specs/decisions/005-client-state-with-zustand.md

Document:

Context:

TrackRanker now has state that needs to survive navigation and, in some cases,
browser refreshes.

Decision:

Use Zustand for shared client-side UI state while keeping server-owned data in
the API/MongoDB architecture.

Explain:

- Why Zustand suits the project's size.
- Why session drafts belong in client state.
- Why filters belong in shared state.
- Why API responses are NOT placed into Zustand.
- Why local component state is still used.
- Persistence trade-offs.
- localStorage trust/validation considerations.
- Alternatives considered at a high level.

# AI prompt evidence

Create:

specs/prompts/010-zustand-state-management.md

Copy this COMPLETE prompt into that file exactly.

Do not modify any previous prompt evidence.

Verify all previous prompt files remain unchanged.

# package documentation

Update package.json/package-lock.json only as required for Zustand.

Document the Zustand dependency in README if appropriate.

Do not manually edit package-lock.json in unsafe ways.

Use npm to install the dependency.

# Verification

Run from frontend:

npm install

or the appropriate install command required to add Zustand.

Then:

npm test

npm run build

If no backend changes occurred, backend builds/tests are not strictly required for every
iteration, but before final reporting run the relevant repository verification expected
by AGENTS.md.

Prefer:

dotnet build backend\TrackRanker.slnx

dotnet test backend\TrackRanker.slnx --no-build

if the environment permits and this matches project instructions.

Also run:

git diff --check
git status

Perform:

- basic secret scan
- generated-file check
- prompt-integrity check

Ensure these have not accidentally become tracked:

node_modules
bin
obj
dist
coverage

Do NOT stage anything.

Do NOT commit.

Do NOT push.

# Manual verification

If the local application is available:

## Draft

1. Open /sessions/new.
2. Enter a partially completed session.
3. Navigate to another page.
4. Return to /sessions/new.
5. Confirm the draft is restored.
6. Refresh the browser.
7. Confirm the draft remains.
8. Clear the draft.
9. Confirm form returns to defaults.
10. Create a real session.
11. Return to /sessions/new.
12. Confirm the successfully created session is no longer present as a draft.

## Edit isolation

13. Create another partial new-session draft.
14. Open an existing session for editing.
15. Confirm edit data comes from the API, not the draft.
16. Make/edit/save or cancel according to existing workflow.
17. Return to /sessions/new.
18. Confirm the original new-session draft was not corrupted by edit mode.

## Repeat Session

If implemented:

19. Have a saved draft.
20. Choose Repeat Session on an existing session.
21. Confirm the repeated session replaces the unrelated draft.
22. Confirm copied session values are correct.

## Session filters

23. Open Sessions.
24. Filter by session type.
25. Filter by status.
26. Open a session and return.
27. Confirm filters remain.
28. Refresh.
29. Confirm filters remain.
30. Clear filters.

## Confidence filter

31. Open Confidence.
32. Select a session-type filter.
33. Navigate away and return.
34. Confirm filter remains.
35. Refresh.
36. Confirm it remains.
37. Reset the filter.

## Responsive

38. Verify major changed screens around 390px width.
39. Confirm no document-level horizontal overflow.
40. Confirm filter controls and draft actions remain usable.

# Quality expectations

- Zustand should solve real shared-state problems.
- Do not put server state into the store without strong justification.
- Do not make every component directly depend on the global store.
- Keep actions typed and understandable.
- Keep persisted state minimal.
- Do not store sensitive information.
- Do not create unnecessary abstractions.
- Do not broadly refactor working application code.
- Do not weaken tests.
- Do not suppress warnings.
- Do not report commands as passing unless they actually passed.

# Final response

When finished, report:

1. Feature summary.
2. Zustand dependency/version added.
3. Store architecture.
4. State managed by Zustand.
5. State deliberately left outside Zustand.
6. New-session draft behaviour.
7. Edit-session isolation.
8. Repeat Session integration, if applicable.
9. Session filtering behaviour.
10. Confidence filtering behaviour.
11. Persistence and defensive handling.
12. Accessibility work.
13. Tests added/updated.
14. Commands run.
15. Exact build/test results.
16. Manual verification performed.
17. README advanced-requirement status.
18. Files created/modified.
19. Any warnings or unresolved issues.
20. git status summary.
21. Recommended next milestone.

IMPORTANT:

Do NOT stage changes.
Do NOT create a commit.
Do NOT push.
Do NOT report a commit hash.

I will review and commit manually.