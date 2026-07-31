You are implementing a small focused TrackRanker improvement.

Milestone 9: repeat a previous training session.

IMPORTANT:
- Do NOT run git add.
- Do NOT create a git commit.
- Do NOT push.
- I will stage and commit manually.
- Keep this milestone intentionally small.
- Do not make unrelated architectural changes.

Before making changes:

1. Read AGENTS.md.
2. Review the existing TrainingSession create/edit workflow.
3. Review TrainingSessionForm.
4. Review the session-detail page.
5. Review the typed API layer.
6. Review the streamlined-session-creation specification.
7. Review relevant frontend tests.
8. Preserve all previous specs/prompts files unchanged.

# Goal

Allow an athlete to quickly create a new training session based on a previous one.

Sprinters frequently repeat similar sessions.

An athlete should not have to manually re-enter:

- session type
- prescription
- intended intensity
- purpose
- focus cue
- success criteria
- coach notes

every time they repeat a workout.

Add a:

"Repeat session"

action to an existing training session.

# Core flow

From:

/sessions/:id

the athlete selects:

Repeat session

Then navigate to:

/sessions/new?copy={sessionId}

or use an equally simple and robust approach consistent with the existing
React Router architecture.

Prefer a URL/query-based approach if practical because it survives refresh.

The normal /sessions/new route must continue working without a copy parameter.

# Repeat behaviour

When opening a copied session:

Fetch the original training session using the existing API.

Prefill:

- SessionType
- Prescription
- IntendedIntensity
- Purpose
- FocusCue
- SuccessCriteria
- CoachNotes

Do NOT copy:

- original ID
- original session date
- original status
- CreatedAtUtc
- UpdatedAtUtc
- SessionCompletion
- repetition results
- reflection
- confidence
- XP
- achievements
- any completed-session information

The new session must be an independent TrainingSession.

# Date

Default the new session date to today's LOCAL calendar date.

Do not copy the old session date.

Do not introduce timezone-sensitive UTC behaviour that changes the displayed day.

Use the same date format expected by the existing create form.

# Status

A repeated session must begin as:

Planned

or the equivalent existing controlled value used by TrackRanker.

Do not copy Completed status from the original session.

# Title behaviour

Follow the title behaviour introduced by the streamlined session milestone.

If TrackRanker automatically generates titles:

Allow the new session to generate its normal title.

Do not copy a generated title unnecessarily.

If the athlete had entered a genuine custom title and the current architecture
can distinguish that cleanly, copying it is acceptable.

Do not introduce complicated title-detection logic solely for this feature.

Prefer consistency with the existing form.

# Clarity fields

Copy existing optional clarity information:

- Purpose
- FocusCue
- SuccessCriteria
- CoachNotes

If any copied clarity information exists:

The "Add more clarity" section should start expanded.

The athlete must be able to edit or remove this information before creating
the new session.

Do not treat copied wording as locked.

# Session detail action

Add a clearly visible but secondary action:

Repeat session

It should sit naturally alongside existing session actions such as Edit.

Do not make it more visually prominent than the primary session information.

Use an appropriate link/button consistent with the existing UI.

# New-session indication

When the create page has been prefilled from another session, provide a short
context message such as:

"Starting from a previous session"

Optionally include the source session title.

Example:

Starting from:
Speed Endurance — 3 × 150m

Keep this concise.

Do not display a large informational panel.

# Form behaviour

Reuse the existing TrainingSessionForm.

Do NOT create a separate RepeatSessionForm.

The form should accept suitable initial values.

Preserve its existing:

- validation
- progressive disclosure
- sprint clarity presets
- create behaviour
- edit behaviour

Do not duplicate form logic.

# Loading state

While the original session is being fetched:

Show an intentional loading state.

Do not display an empty create form and then suddenly replace values.

# Invalid source ID

If the copy query contains a malformed ID or the original session does not exist:

Do not crash.

Show a concise message:

"That session couldn't be loaded."

Provide actions such as:

"Create a blank session"

and/or

"Back to sessions"

The athlete should still be able to create a normal session.

Do not expose raw API exceptions.

# API failure

If loading the source session fails:

The user should be able to continue with a blank create form.

Do not block all session creation because the repeat operation failed.

# Create behaviour

Submitting the repeated session must use the EXISTING:

POST /api/training-sessions

Do not create:

POST /api/training-sessions/{id}/repeat

or any new backend endpoint.

The existing create API is sufficient.

This milestone should preferably require NO backend changes.

# After creation

Follow the existing successful create behaviour.

Normally navigate to the newly created session detail page.

Ensure the source session remains completely unchanged.

# Completed-session isolation

This is particularly important.

Repeating a session must never copy:

- SessionCompletion
- ActualIntensity
- PerceivedDifficulty
- repetition results
- WentWell
- Improved
- WasDifficult
- NextFocus
- completed-session CoachFeedback
- ConfidenceBefore
- ConfidenceAfter

Only planned-session information is reusable.

# Gamification isolation

Repeating a planned session must award:

0 XP

XP remains based on actual SessionCompletion data.

Do not modify ProgressService.

Do not unlock achievements merely because a planned session was repeated.

# UX copy

Use athlete-friendly wording.

Preferred:

Repeat session

Starting from a previous session

Create session

Avoid:

Duplicate record

Clone training entity

Copy metadata

TrackRanker should sound like a training tool rather than database software.

# Responsive design

Ensure:

- Repeat action works at mobile widths.
- Context message wraps.
- Prefilled form remains usable around 390px.
- No horizontal overflow is introduced.

# Accessibility

Ensure:

- Repeat session action has meaningful accessible text.
- Loading/error states are readable by assistive technologies.
- Existing form labels remain intact.
- Focus behaviour after navigation is sensible.
- Copied-session context is textual and not colour-only.

# Frontend tests

Add/update tests covering at minimum:

1. Session detail displays a Repeat session action.
2. Repeat action points to the correct source session.
3. Opening a valid copied session loads the source session.
4. Session type is prefilled.
5. Prescription is prefilled.
6. Intended intensity is prefilled.
7. Existing clarity information is prefilled.
8. Clarity section opens when copied clarity exists.
9. Date defaults to today rather than the source date.
10. Status is Planned rather than copied from a completed source.
11. Completion/reflection information is not copied.
12. Athlete can edit prefilled values before submission.
13. Submitting uses the normal create-session API.
14. Source-session load failure allows blank session creation.
15. Normal /sessions/new without a copy parameter still behaves exactly as before.

Mock API calls.

Do not require a live backend.

# Existing functionality

Do not break:

- normal session creation
- streamlined session form
- session editing
- session deletion
- completion logging
- reflection
- confidence history
- TrackRank progress
- XP feedback
- Dashboard
- existing routing
- existing tests

# Out of scope

Do NOT add:

- session templates stored in MongoDB
- favourite sessions
- workout libraries
- workout recommendations
- AI session generation
- automatic progression recommendations
- calendar scheduling
- recurring schedules
- bulk session creation
- duplicated completion data
- new backend endpoints
- new MongoDB collections
- gamification changes
- streaks
- leaderboards
- authentication
- accounts
- Zustand
- theme switching
- deployment changes
- unrelated dependencies

# Documentation

Create:

specs/09-repeat-session.md

Keep it short.

Document:

- User problem.
- Repeat-session workflow.
- Fields that are copied.
- Fields that are intentionally reset.
- Why completed-session data is never copied.
- Why the existing POST endpoint is reused.
- Error/fallback behaviour.
- Deferred template functionality.

Create:

specs/prompts/009-repeat-session.md

Copy this COMPLETE prompt into that file exactly.

Do not modify previous prompt evidence.

Update README.md only if the implemented-feature summary should mention Repeat Session.

Do not rewrite unrelated documentation.

# Verification

Run from frontend:

npm test

npm run build

Run:

git diff --check
git status

Perform normal generated-file and secret checks.

If no backend files change, a backend implementation change is not required.

Do NOT stage.
Do NOT commit.
Do NOT push.

# Manual verification

If the app is available locally:

1. Open an existing completed session.
2. Select Repeat session.
3. Confirm planned workout fields are populated.
4. Confirm today's date is used.
5. Confirm the new session is Planned.
6. Confirm clarity information is editable.
7. Confirm no completed-session results appear.
8. Change the prescription slightly.
9. Create the repeated session.
10. Confirm it receives a new ID.
11. Confirm the original session remains unchanged.
12. Confirm no XP is awarded until the new session is actually completed.
13. Test a session without clarity fields.
14. Test mobile width around 390px.

Clean up any temporary verification session if appropriate.

# Final response

Report:

1. Feature summary.
2. Files changed.
3. Repeat-session flow.
4. Fields copied.
5. Fields reset/not copied.
6. Failure handling.
7. Tests added/updated.
8. Commands run.
9. Exact test/build results.
10. Manual verification.
11. Any unresolved issues.
12. git status summary.

IMPORTANT:

Do NOT stage changes.
Do NOT create a commit.
Do NOT push.
Do NOT report a commit hash.

I will review and commit manually.