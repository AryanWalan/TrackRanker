You are implementing the next focused milestone of TrackRanker:
process-based gamification and TrackRank progression.

IMPORTANT:
- Do NOT run git add.
- Do NOT create a git commit.
- Do NOT push anything.
- I will stage and commit manually.
- You may use git status and git diff for review.
- Implement only this milestone.
- Do not make unrelated architectural changes.

Before making changes:

1. Read AGENTS.md.
2. Read README.md.
3. Read all current product, architecture, session, completion,
   confidence and dashboard specs.
4. Review the TrainingSession and SessionCompletion models.
5. Review ConfidenceHistoryService because it already derives information
   from stored training data.
6. Review the Dashboard and navigation.
7. Review all existing backend and frontend tests.
8. Preserve every existing specs/prompts file unchanged.

# Project context

TrackRanker is a training-clarity and confidence application designed
specifically for 100m, 200m and 400m sprinters.

Current functionality includes:

- Planned training session CRUD.
- Streamlined session creation.
- Optional training clarity.
- Session completion.
- Repetition results.
- Post-session reflection.
- Coach feedback.
- Confidence before and after sessions.
- Evidence-based confidence history.
- Recent-training Dashboard.
- MongoDB persistence.
- React + TypeScript frontend.
- C# .NET 10 backend.
- Scalar API documentation.
- Automated frontend and backend tests.

# Milestone goal

Introduce TrackRanker's first explicit gamification system.

Implement:

1. Process-based XP.
2. Personal TrackRank levels.
3. Achievements.
4. A Progress page.
5. A small Progress summary on the Dashboard.

Do NOT implement a leaderboard.

TrackRank represents the athlete's engagement with their own training process.

It is NOT a ranking against other athletes.

# Product philosophy

TrackRanker should reward healthy training behaviours.

Reward:

- Completing planned sessions.
- Reflecting on training.
- Recording confidence before and after training.

Do NOT reward:

- Training more days than prescribed.
- Completing additional unplanned sessions.
- Higher intensity.
- Faster repetition times.
- Greater training volume.
- Personal bests.
- Training through pain.
- Comparing performance against other athletes.

Gamification should reinforce consistency and reflection,
not encourage excessive training.

# XP rules

Use the following rules.

Completed session:
+20 XP

Meaningful reflection:
+10 XP

Paired confidence check-in:
+5 XP

Therefore a fully logged session may earn:

35 XP

# Definition: completed session

Award completion XP when a SessionCompletion exists.

Do not rely solely on TrainingSession.Status because completion records
are the source of truth for actual completed-session information.

# Definition: meaningful reflection

A completion has a meaningful reflection when at least one of these
contains non-whitespace content:

- WentWell
- Improved
- WasDifficult
- NextFocus
- CoachFeedback

Do not count an empty reflection object.

# Definition: paired confidence

Award confidence XP only when BOTH:

- ConfidenceBefore exists
- ConfidenceAfter exists

A session with only one confidence value does not earn this XP component.

# Important XP behaviour

XP must be DERIVED from existing stored data.

Do NOT create a mutable XP balance.

Do NOT create a new MongoDB collection for XP.

Do NOT store XP directly on TrainingSession or SessionCompletion.

This avoids consistency problems if a completion or reflection is edited
or deleted.

The athlete's XP should always represent their current stored evidence.

# TrackRank levels

Use a simple predictable level system.

Every 100 XP increases TrackRank by one level.

Formula:

Level = floor(TotalXp / 100) + 1

Examples:

0 XP = TrackRank 1

35 XP = TrackRank 1

99 XP = TrackRank 1

100 XP = TrackRank 2

235 XP = TrackRank 3

Return enough information to display:

- Current TrackRank
- Total XP
- XP earned within current rank
- XP required for next rank

Example:

Total XP: 135

TrackRank: 2

Current-rank XP:
35 / 100

Do not add arbitrary maximum levels.

# TrackRank wording

Use:

"TrackRank 1"
"TrackRank 2"
"TrackRank 3"

Do not give levels performance-related names such as:

Elite
National
Professional
Champion

TrackRank measures app engagement/process behaviours,
not sprint ability.

Make this clear in the UI.

# Achievements

Implement the following initial achievements.

## 1. First Finish

Requirement:
1 completed session

Description:
"Log your first completed training session."

## 2. Reflective Start

Requirement:
1 meaningful reflection

Description:
"Reflect on your first completed session."

## 3. Building Routine

Requirement:
5 completed sessions

Description:
"Log five completed training sessions."

## 4. Looking Back

Requirement:
5 meaningful reflections

Description:
"Complete five post-session reflections."

## 5. Check In

Requirement:
3 sessions with paired before-and-after confidence ratings

Description:
"Record confidence before and after three sessions."

## 6. Ten Sessions

Requirement:
10 completed sessions

Description:
"Log ten completed training sessions."

Do not add additional achievements unless clearly necessary.

# Achievement behaviour

Achievements should also be DERIVED.

Do NOT create an achievement collection in this milestone.

Each achievement response should contain:

- Id
- Name
- Description
- IsUnlocked
- CurrentProgress
- RequiredProgress

Example:

{
  "id": "building-routine",
  "name": "Building Routine",
  "description": "Log five completed training sessions.",
  "isUnlocked": false,
  "currentProgress": 3,
  "requiredProgress": 5
}

Clamp CurrentProgress to RequiredProgress for display purposes.

For example:

12 completed sessions for a 5-session achievement:

CurrentProgress = 5
RequiredProgress = 5

Do not return:

12 / 5

# Backend endpoint

Create:

GET /api/progress

This is a read-only endpoint.

Return something conceptually similar to:

ProgressResponse
- TotalXp
- TrackRank
- CurrentRankXp
- XpPerRank
- CompletedSessions
- MeaningfulReflections
- PairedConfidenceCheckIns
- Achievements

Use DTOs.

Do not expose MongoDB models.

# Example

A user with:

4 completed sessions
3 meaningful reflections
2 paired confidence check-ins

would receive:

Completed session XP:
4 × 20 = 80

Reflection XP:
3 × 10 = 30

Confidence XP:
2 × 5 = 10

Total:
120 XP

TrackRank:
2

CurrentRankXp:
20

# Backend architecture

Follow the existing architecture:

Controller
→ Service
→ existing repositories

Create:

IProgressService

ProgressService

ProgressController

Relevant DTOs.

Prefer reusing existing repositories.

Do not create duplicate MongoDB query implementations.

Do not query MongoDB directly from the controller.

Do not introduce another persistence technology.

Use async operations.

# Empty state behaviour

GET /api/progress should return HTTP 200 even when no training data exists.

Example concept:

{
  "totalXp": 0,
  "trackRank": 1,
  "currentRankXp": 0,
  "xpPerRank": 100,
  "completedSessions": 0,
  "meaningfulReflections": 0,
  "pairedConfidenceCheckIns": 0,
  "achievements": [...]
}

Achievements should appear locked with zero progress.

Do not return 404.

# Frontend route

Add:

/progress

Add Progress to the main application navigation.

Use the label:

Progress

Do not use "Leaderboard".

# Progress page heading

Use:

Your TrackRank

Supporting copy:

"Build your rank by completing sessions, reflecting, and checking in with your confidence."

Add a short secondary explanation:

"TrackRank reflects your training process, not how fast you run."

Keep this visually concise.

# Main TrackRank card

Prominently show:

TrackRank 2

120 XP

Then show progress toward the next TrackRank.

Example:

20 / 100 XP to next rank

Use an accessible progress element or an appropriately labelled custom
progress bar.

Do not communicate progress using colour alone.

# XP explanation

Include a small section explaining how XP is earned.

Keep it concise:

Complete a session
+20 XP

Add a reflection
+10 XP

Confidence check-in
+5 XP

This is important so gamification rules are transparent.

Do not hide the rules.

# Process summary

Show three useful totals:

Completed sessions

Reflections

Confidence check-ins

Avoid adding unnecessary analytics.

# Achievements section

Heading:

Achievements

Display all six achievements.

Unlocked achievements should be visually distinct.

Locked achievements should show their progress.

Example:

Building Routine

3 / 5 sessions

Do not hide locked achievements.

This gives athletes visible goals.

# Achievement accessibility

Do not rely only on icons or colour.

Each achievement must state either:

Unlocked

or

its progress.

If decorative icons are used, they should not replace text.

Do not install an icon package solely for this feature.

# Dashboard integration

Add a SMALL TrackRank summary to the existing Dashboard.

Do not make gamification dominate the Dashboard.

Show approximately:

TrackRank 2

120 XP

20 / 100 to next rank

Provide:

"View progress"

→ /progress

Reuse GET /api/progress.

Keep Recent Training and Quick Actions intact.

If the progress request fails:

The Dashboard should remain usable.

Display the existing athlete-facing content normally.

Do not expose technical exceptions.

# Loading states

Progress page should have:

- loading state
- successful state
- error state

Dashboard progress card should also handle loading/error gracefully.

Do not add external skeleton-loading dependencies.

# Responsive design

Ensure:

- TrackRank card works on mobile.
- Progress bar fits narrow screens.
- Achievement cards stack appropriately.
- Long achievement descriptions wrap.
- XP explanation is easy to scan.
- No horizontal page overflow.
- Touch targets remain appropriate.

# Accessibility

Ensure:

- Semantic heading structure.
- Accessible progress indicator.
- Achievements expose text status.
- XP rules are readable by screen readers.
- Focus states remain visible.
- Links/buttons have meaningful labels.
- Gamification state is never conveyed through colour alone.

# Frontend API layer

Extend the existing central API layer.

Add TypeScript types such as:

Progress
AchievementProgress

Add:

getProgress()

Do not call fetch directly from route components if the project already
centralises API calls.

# Backend tests

Add meaningful tests covering at minimum:

1. Empty progress returns HTTP 200.
2. Zero data returns TrackRank 1 and 0 XP.
3. Completed session awards exactly 20 XP.
4. Meaningful reflection awards exactly 10 additional XP.
5. Empty/whitespace-only reflection does not award reflection XP.
6. Paired confidence awards exactly 5 additional XP.
7. One-sided confidence does not award paired-confidence XP.
8. XP from multiple sessions is calculated correctly.
9. TrackRank boundary at 99 XP remains rank 1.
10. TrackRank boundary at 100 XP becomes rank 2.
11. CurrentRankXp is calculated correctly.
12. Achievement progress is calculated correctly.
13. Achievements unlock exactly at their threshold.
14. Achievement progress is clamped to its threshold.
15. Deleted/absent completion data cannot contribute XP.

Use existing test conventions.

Normal tests must not require a live MongoDB service.

# Frontend tests

Add meaningful tests covering at minimum:

1. Progress page loading state.
2. Empty progress renders TrackRank 1.
3. Total XP renders correctly.
4. Rank-progress indicator renders the correct progress.
5. XP earning rules are visible.
6. Process totals render.
7. Unlocked achievement renders as Unlocked.
8. Locked achievement renders progress.
9. Progress API error produces a useful error state.
10. Progress navigation link works.
11. Dashboard displays TrackRank summary.
12. Dashboard links to /progress.
13. Dashboard remains usable if progress loading fails.

Mock API calls.

Do not require a live backend.

# Existing functionality

Do not break:

- Dashboard quick actions.
- Recent training.
- Training session CRUD.
- Streamlined session creation.
- Session completion.
- Repetition results.
- Session reflection.
- Confidence history.
- Confidence filtering/chart.
- Session navigation.
- Health endpoint.
- Scalar.
- Existing tests.

# Out of scope

Do NOT implement:

- Leaderboards.
- Comparing athletes.
- Social functionality.
- Streaks.
- Daily streaks.
- Weekly streaks.
- Authentication.
- Accounts.
- Multiple athlete profiles.
- User registration.
- Coach accounts.
- Personal best gamification.
- Rewards for sprint times.
- Rewards for intensity.
- Rewards for training volume.
- Rewards for extra sessions.
- Badge sharing.
- Notifications.
- AI recommendations.
- AI encouragement.
- Training recommendations.
- Race predictions.
- WebSockets.
- Zustand.
- Theme switching.
- Rate limiting.
- Deployment changes.
- Docker changes.
- Unrelated dependency upgrades.

Do not expand this milestone beyond the gamification foundation.

# Documentation

Create:

specs/07-process-gamification.md

Document:

- Gamification purpose.
- Process-based philosophy.
- XP rules.
- TrackRank calculation.
- Achievement definitions.
- Why gamification data is derived.
- Why sprint performance is not rewarded.
- API design.
- Progress page UX.
- Dashboard integration.
- Accessibility considerations.
- Deferred gamification functionality.

Create:

specs/decisions/004-process-based-gamification.md

Document the following decision:

Context:

Gamification could accidentally reward athletes for excessive training,
higher intensity or faster results.

Decision:

TrackRanker rewards engagement with the training process instead.

Explain:

- Why completed sessions earn XP.
- Why reflection earns XP.
- Why confidence check-ins earn XP.
- Why sprint performance does not affect TrackRank.
- Why XP and achievements are derived instead of stored.
- Why there is currently no leaderboard.
- Trade-offs.

Update:

README.md

Add the implemented gamification feature.

Clearly explain how TrackRank works.

Update the section explaining how TrackRanker relates to the assessment's
gamification theme.

Only update other specs where factually necessary.

Do not rewrite unrelated documentation.

# AI prompt evidence

Create:

specs/prompts/007-process-gamification.md

Copy this COMPLETE prompt into the file exactly.

Do not modify previous prompt evidence.

Verify all earlier prompt files remain unchanged.

# Verification

Run:

dotnet build backend\TrackRanker.slnx

dotnet test backend\TrackRanker.slnx --no-build

From frontend:

npm test

npm run build

Also run:

git diff --check
git status

Perform a basic secret scan.

Ensure generated directories such as:

node_modules
bin
obj
dist
coverage

have not accidentally become tracked.

Do NOT run git add.

Do NOT commit.

# Manual verification

If the local application and MongoDB are available:

1. Open /progress with existing data.
2. Manually calculate expected XP from stored completions.
3. Confirm TrackRanker's total matches.
4. Confirm current TrackRank is correct.
5. Confirm XP-to-next-rank calculation.
6. Confirm achievement progress.
7. Confirm unlocked achievements correspond to real stored evidence.
8. Open Dashboard.
9. Confirm TrackRank summary appears.
10. Follow View progress.
11. Verify mobile layout at approximately 390px width.
12. Confirm no horizontal page overflow.
13. Restart the API.
14. Confirm derived progress remains identical from persisted data.

Do not create unnecessary permanent verification records.

If temporary records are required, clean them up afterward.

# Quality expectations

- Gamification rules must be deterministic.
- Gamification rules must be transparent.
- Do not fabricate achievements.
- Do not reward excessive training.
- Do not infer athletic ability from TrackRank.
- Do not duplicate existing stored data unnecessarily.
- Reuse existing architecture.
- Avoid broad refactors.
- Do not weaken existing tests.
- Do not suppress warnings.
- Do not report commands as successful unless they actually passed.

# Final response

When finished, report:

1. Feature summary.
2. Files created and modified.
3. XP rules implemented.
4. TrackRank calculation.
5. Achievements implemented.
6. Backend architecture.
7. Progress page UX.
8. Dashboard integration.
9. Accessibility work.
10. Backend tests added.
11. Frontend tests added.
12. Commands run.
13. Exact build/test results.
14. Manual verification performed.
15. Any warnings or unresolved issues.
16. git status summary.
17. Recommended next small milestone.

IMPORTANT:

Do NOT create a commit.
Do NOT stage changes.
Do NOT push.
Do NOT report a commit hash.

I will review and commit manually.