You are implementing a small focused TrackRanker improvement.

Milestone 8: immediate progress feedback after saving a session completion.

IMPORTANT:
- Do NOT run git add.
- Do NOT commit.
- Do NOT push.
- I will stage and commit manually.
- Keep this milestone intentionally small.
- Do not make unrelated architectural changes.

Before making changes:

1. Read AGENTS.md.
2. Read README.md.
3. Read specs/03-session-completion-and-reflection.md.
4. Read specs/07-process-gamification.md.
5. Review the existing session-completion create/edit workflow.
6. Review GET /api/progress and its frontend API integration.
7. Review the Progress page and Dashboard progress card.
8. Review existing tests.
9. Preserve all previous prompt evidence unchanged.

# Goal

Give athletes immediate feedback when saving a session completion.

Currently TrackRanker derives XP and TrackRank correctly, but athletes only
see those changes when they visit the Progress page or Dashboard.

After a successful completion create or edit, show the actual change in
process-based XP.

Do not introduce new gamification rules.

# Core behaviour

Before submitting a session completion:

Fetch the current progress state using the existing:

GET /api/progress

After the completion has successfully been created or updated:

Fetch progress again.

Calculate:

xpChange = newProgress.totalXp - previousProgress.totalXp

Use the backend-derived total as the source of truth.

Do NOT independently recreate XP business rules in the frontend for the
purpose of calculating the change.

# Why this approach

Progress is already derived by the backend.

Comparing progress before and after a completion update ensures the feedback
remains correct when an athlete:

- creates a completion
- adds a reflection later
- adds paired confidence later
- removes previously qualifying reflection content
- removes one side of a confidence check-in
- edits information without changing XP

Do not store XP locally as permanent state.

# Feedback states

## Positive XP change

Example:

Progress earned

+35 XP

TrackRank 1 · 65 / 100 XP

Provide a link:

View progress

→ /progress

## No XP change

If the completion saved successfully but XP did not change:

Do not show "+0 XP" prominently.

Instead show a concise success message such as:

Session updated

Your progress total is unchanged.

Optionally show:

TrackRank 1 · 65 / 100 XP

## Negative XP change

Editing an existing completion may remove qualifying reflection or confidence data.

If XP decreases, present this neutrally.

Example:

Progress updated

-10 XP

TrackRank 1 · 55 / 100 XP

Do not frame this as:

"Lost XP!"
"Penalty"
"Bad result"

It is simply reflecting the currently stored training evidence.

# Rank-up feedback

Compare previous TrackRank with the updated TrackRank.

If:

newProgress.trackRank > previousProgress.trackRank

show:

TrackRank increased

TrackRank 2

Do not add animation, confetti, sound effects, or external celebration libraries.

Keep the feedback visually positive but restrained.

# Achievement unlock feedback

Compare previous and updated achievement states.

If one or more achievements changed from:

isUnlocked = false

to:

isUnlocked = true

show them in the feedback.

Example:

Achievement unlocked

Reflective Start
Reflect on your first completed session.

If several unlock at once, show each newly unlocked achievement.

Do not show already-unlocked achievements.

Do not create new achievement logic.

Use the response from GET /api/progress.

# Important failure behaviour

Saving the completion is the primary action.

If:

POST/PUT completion succeeds

but:

the follow-up GET /api/progress fails

the athlete must still see that their session was saved successfully.

Show:

Session saved

Progress information is temporarily unavailable.

Do not treat the completion save as failed.

Do not roll back the saved completion.

# Pre-submit progress failure

If the initial progress request fails before submission:

Do NOT block the user from saving their completion.

Proceed with the normal save.

After successful save, attempt to load progress again.

If there is no reliable before value, do not invent an XP delta.

Show:

Session saved

Then display current TrackRank/progress if the post-save request succeeds.

Do not claim "+35 XP" without evidence of the previous total.

# Frontend implementation

Keep this frontend-focused unless a very small existing API adjustment is genuinely required.

Prefer NO backend changes.

Reuse:

getProgress()

and the existing completion API calls.

Do not create:

POST /api/progress
POST /api/xp
POST /api/achievements

Progress remains read-only and derived.

# Completion form workflow

Integrate this into the existing session completion save workflow.

Do not duplicate the entire form.

Before save:

1. Attempt to fetch current progress.
2. Submit completion create/update.
3. If save succeeds, fetch updated progress.
4. Calculate feedback where enough information exists.
5. Display success/progress feedback.

Do not make the athlete wait unnecessarily if progress loading is slow.

Keep loading behaviour understandable.

# Where to display feedback

Use the existing post-save navigation behaviour if practical.

If the app currently returns the athlete to the session detail page after save:

Pass short-lived navigation state or use another simple non-persistent mechanism
to display the feedback on the destination page.

Do not store temporary feedback in MongoDB.

Do not add a global notification/state library.

If remaining on the completion page is more consistent with the existing UX,
display the feedback there.

Choose the smallest clean implementation.

Document the decision.

# Feedback component

Create a small reusable component if it improves clarity.

Possible name:

ProgressEarnedFeedback

It may receive:

- xpChange
- currentProgress
- previousTrackRank
- newlyUnlockedAchievements
- whether the delta is known

Keep it presentation-focused.

Do not place progress business rules inside the component.

# UI design

The feedback should be easy to notice without taking over the screen.

Possible layout:

Session logged

+35 XP

TrackRank 1
65 / 100 XP

Achievement unlocked:
Reflective Start

View progress

Use existing TrackRanker styling.

Do not introduce modal dialogs for normal successful saves.

Do not use confetti.

Do not add animations beyond existing subtle UI behaviour.

# Accessibility

Ensure:

- Success feedback is announced appropriately.
- XP change is available as text.
- Rank changes do not rely on colour.
- Achievement names and descriptions are readable.
- Progress uses an accessible progress element where practical.
- View progress has meaningful link text.
- Focus behaviour after save/navigation remains sensible.

# Mobile

Ensure the feedback:

- fits around 390px width
- does not overflow
- uses readable spacing
- keeps the View progress action easy to tap
- wraps achievement descriptions correctly

# Testing

Add/update frontend tests covering at minimum:

1. Successful new completion compares progress before and after.
2. Positive XP delta displays correctly.
3. No-change update does not prominently display "+0 XP".
4. Negative XP delta is presented neutrally.
5. Rank increase is detected and displayed.
6. Newly unlocked achievement is displayed.
7. Previously unlocked achievements are not displayed as newly unlocked.
8. Multiple newly unlocked achievements render correctly.
9. Pre-save progress failure does not block completion submission.
10. Post-save progress failure still reports the session as successfully saved.
11. Unknown previous progress does not fabricate an XP delta.
12. View progress links to /progress.

Mock API calls.

Do not require a live backend.

# Existing functionality

Do not break:

- session creation
- session editing
- session completion creation
- session completion editing
- completion deletion
- reflections
- confidence history
- Progress page
- Dashboard TrackRank summary
- existing navigation
- existing tests

# Out of scope

Do NOT add:

- new XP rules
- new achievements
- streaks
- leaderboards
- social features
- notifications
- browser push notifications
- sound
- confetti
- animations
- authentication
- accounts
- multiple athletes
- new MongoDB collections
- stored XP
- stored ranks
- stored achievement state
- Zustand
- theme switching
- deployment changes
- security features
- unrelated dependency upgrades

# Documentation

Create:

specs/08-session-progress-feedback.md

Keep it concise.

Document:

- UX problem addressed.
- Before/after progress comparison.
- Why backend progress remains the source of truth.
- Positive, unchanged, negative, and unknown-delta states.
- Rank-up behaviour.
- Achievement-unlock behaviour.
- Progress-fetch failure handling.
- Temporary/non-persistent feedback design.
- Deferred features.

Create:

specs/prompts/008-session-progress-feedback.md

Copy this COMPLETE prompt into that file exactly.

Do not modify previous prompt files.

Only update README.md if necessary to describe this now-implemented behaviour.

Do not rewrite unrelated README content.

# Verification

Run from frontend:

npm test
npm run build

If no backend files changed, do not unnecessarily modify backend code.

Still ensure the application types against the existing API contracts.

Run:

git diff --check
git status

Perform the normal generated-file and secret checks.

Do NOT stage.
Do NOT commit.
Do NOT push.

# Manual verification

Using the local app if available:

1. Note current XP.
2. Create a completion with no reflection/confidence.
3. Verify +20 XP feedback.
4. Edit it and add a meaningful reflection.
5. Verify +10 XP feedback.
6. Edit it and add both confidence values.
7. Verify +5 XP feedback.
8. Edit without changing XP-qualified data.
9. Verify the no-change state.
10. If practical, temporarily remove qualifying reflection content and verify
    the negative change is presented neutrally.
11. Verify View progress.
12. Verify mobile layout around 390px.
13. Clean up temporary test records if created.

# Final response

Report:

1. Feature summary.
2. Files changed.
3. Progress comparison workflow.
4. XP feedback states.
5. Rank-up behaviour.
6. Achievement-unlock behaviour.
7. Failure handling.
8. Tests added/updated.
9. Commands run.
10. Exact test/build results.
11. Manual verification.
12. Any unresolved issues.
13. git status summary.

IMPORTANT:

Do NOT create a commit.
Do NOT stage changes.
Do NOT push.
Do NOT report a commit hash.

I will review and commit manually.