You are implementing a focused UX improvement milestone for TrackRanker.

Milestone: First-Time Experience, Navigation Clarity, and Confidence UX.

IMPORTANT:
- Do NOT run git add.
- Do NOT create a git commit.
- Do NOT push.
- I will stage and commit manually.
- Do not add unrelated features.
- Do not make unnecessary backend changes.
- This milestone should primarily improve usability, clarity, information hierarchy,
  onboarding, and navigation.

Before making changes:

1. Read AGENTS.md.
2. Read README.md.
3. Read all current product and UX specifications.
4. Review:
   - DashboardPage
   - Sessions page
   - session create page
   - Confidence page
   - Progress page
   - Profile page
   - primary navigation
   - confidence/reflection cards
   - TrackRank/Zustand state if currently implemented
5. Review existing frontend tests.
6. Review existing responsive styles.
7. Preserve all previous files in specs/prompts unchanged.

# Project context

TrackRanker is a training-clarity, confidence, and process-gamification application
for competitive 100m, 200m, and 400m sprinters.

The intended athlete journey is:

1. Log the training session their coach has prescribed.
2. Understand the purpose and focus of that session if needed.
3. Complete the session.
4. Record how the session actually went.
5. Reflect on what went well and what to improve.
6. Record confidence before and after training.
7. Build confidence from previous training evidence.
8. Earn process-based TrackRank progress through healthy training behaviours.

TrackRanker is NOT:

- a training-program generator
- a replacement for a coach
- a social network
- a generic running tracker
- a leaderboard between athletes

# User feedback driving this milestone

The current app has several usability problems:

1. The Profile page currently does nothing useful.

2. "Log a session" and "View training" feel too similar and it is not immediately
   obvious why the athlete would choose one over the other.

3. The formatting of reflected sessions on the Confidence page is unclear and
   difficult to scan.

4. The Confidence page heading does not clearly explain:
   - what the page is for
   - what information will appear there
   - what the athlete needs to do to build confidence history

5. The application is not currently self-explanatory to a first-time user.

6. A new athlete opening the application may not immediately understand:
   - what TrackRanker does
   - why they should use it
   - where they should begin

The goal of this milestone is to fix these problems.

# Core usability goal

A first-time user should understand TrackRanker within approximately 10 seconds.

From the Dashboard they should understand:

WHO IT IS FOR:
100m, 200m and 400m sprinters.

WHAT IT DOES:
helps athletes understand training, reflect on sessions, and build confidence from
their own training history.

WHAT TO DO FIRST:
log a training session.

# 1. Dashboard / landing-page redesign

The Dashboard should become the main onboarding and orientation page.

Do not turn it into a long marketing website.

It should remain an application dashboard.

At the top, clearly communicate the product.

Use content similar to:

TrackRanker

"Training clarity and confidence for 100m, 200m and 400m sprinters."

Supporting copy:

"Log what your coach gives you, understand your sessions, reflect on how they went,
and build confidence from your own training."

The exact copy may be refined for readability, but preserve this meaning.

Keep the language direct and athlete-focused.

Avoid generic marketing language such as:

"Unlock your full potential."
"Revolutionise your performance."
"Become the best version of yourself."

# Dashboard hero hierarchy

The hierarchy should clearly be:

TrackRanker
↓
what it is
↓
how to begin
↓
current/recent athlete information

Do not place TrackRank, system status, or recent training above the basic explanation
of what TrackRanker does.

# 2. "How TrackRanker works"

Add a short 3-step explanation on the Dashboard.

Use:

## 1. Log your session

Supporting text:

"Add the training session your coach has prescribed."

## 2. Complete and reflect

Supporting text:

"Record how the session went, what you learned, and how confident you felt."

## 3. Build confidence

Supporting text:

"Look back at your training evidence, reflections, and progress."

This should be visually easy to scan.

Do not make these huge cards that dominate the entire page.

They should explain the workflow quickly.

# 3. Clarify the primary actions

The existing:

"Log a session"
"View training"

actions are too similar.

Keep:

"Log a session"

Route:

/sessions/new

Supporting copy:

"Add today's or an upcoming training session."

Rename:

"View training"

to:

"Training history"

Route:

/sessions

Supporting copy:

"View, repeat, and manage sessions you've already logged."

The distinction should be visually obvious:

Log a session
= create something new

Training history
= view/manage existing sessions

"Log a session" should be the primary action.

"Training history" should be secondary.

Do not make both actions visually identical if doing so obscures hierarchy.

# 4. Dashboard recent training

Keep the existing Recent Training section.

Do not remove useful existing behaviour.

The flow should become:

Product explanation
→ How it works
→ Primary actions
→ Current/recent athlete information

Recent Training should continue showing a concise set of recent sessions.

Do not expand it unnecessarily.

# 5. Dashboard TrackRank summary

If TrackRank/Progress is currently displayed on the Dashboard:

keep it.

However:

Do not allow gamification to explain the app before the core training workflow does.

TrackRank should appear after the onboarding / primary-action information.

The athlete must understand:

"TrackRank reflects engagement with your training process, not sprint ability."

Avoid making TrackRank appear like a ranking against other athletes.

# 6. Backend health status

Keep health/system connection information if currently useful for development.

However, it must remain visually secondary.

It should not look like a primary athlete feature.

Use concise wording such as:

System connected

or:

Connection unavailable

Do not expose:

API URLs
MongoDB terminology
HTTP status codes
developer-oriented language

in the normal Dashboard UI.

# 7. Remove the unused Profile experience

The current Profile page does not provide useful functionality.

Remove Profile from the main navigation.

If /profile currently exists:

Preferred approach:

Remove it from visible navigation.

If there are no dependencies requiring it, either:

- remove the placeholder route/page cleanly
or
- redirect /profile to /

Choose whichever results in the cleanest existing architecture.

Do not leave a visible dead navigation item.

Do not build an athlete-profile feature as part of this milestone.

Profile functionality is explicitly deferred.

# Main navigation after this milestone

The primary navigation should approximately be:

Dashboard
Sessions
Confidence
Progress

Use existing terminology where appropriate.

Do not add more navigation sections.

# 8. Sessions terminology

Review user-facing wording across Sessions-related screens.

Keep consistency:

"Log a session"
= create new session

"Sessions" or "Training history"
= collection of previously logged sessions

Do not use different phrases for the same action unnecessarily.

For example, avoid randomly switching between:

Add workout
Create training
Log activity
New exercise
Log session

Prefer:

Log a session

throughout the app when referring to creating a training session.

# 9. Confidence page purpose

The Confidence page currently does not explain itself clearly enough.

Change its introductory area.

Preferred heading:

"Your Confidence Evidence"

Supporting text concept:

"See what your previous sessions say about your preparation. Complete sessions and
add short reflections to build your confidence history."

You may refine the wording, but it must explain:

- the page uses previous training
- the athlete needs to complete/reflection-log sessions
- the goal is evidence-based confidence

Avoid vague headings with no explanation.

Do not make psychological claims.

# 10. Confidence page action guidance

If the athlete has little or no confidence/reflection data, make it very clear what to do.

Use an empty/onboarding state concept like:

"Build your confidence history"

Supporting text:

"After training, log how the session went, record your confidence, and add a short
reflection. TrackRanker will use that history to help you look back at evidence from
your own training."

Primary action:

"View sessions"

→ /sessions

If it is more appropriate in the existing flow, a secondary action may link to:

"Log a session"

→ /sessions/new

Do not overwhelm the empty state with multiple competing buttons.

# 11. Explain confidence ratings where needed

The athlete should understand what:

Confidence before
Confidence after

mean.

If necessary, use concise helper text.

For example:

Before:
"How confident did you feel going into the session?"

After:
"How confident did you feel after completing it?"

Do not add long explanations.

Do not change the existing confidence scale unless required for usability consistency.

# 12. Reformat confidence/reflection history

The existing reflected-session formatting is unclear.

Redesign the visual hierarchy of confidence-history entries.

Each entry should feel like a readable training reflection, not raw stored data.

Example structure:

Speed Endurance — 3 × 150m

30 July

Confidence
3 / 5 before → 4 / 5 after

What went well
Stayed relaxed through the final 50m.

What improved
My final repetition was more controlled.

Next focus
Keep my shoulders relaxed.

Coach feedback
Good rhythm.

View session

This is a conceptual layout.

Adapt it cleanly to the existing data model and styles.

# Reflection formatting principles

Display:

- Session title prominently.
- Session type/date secondarily.
- Confidence change clearly.
- Reflection sections as readable blocks.
- View session action at the bottom.

Do NOT display empty reflection fields.

If WentWell is empty:
do not show a "What went well" heading with blank content.

If CoachFeedback is empty:
do not display it.

Only render sections containing actual meaningful content.

# Reflection priority

Prioritise visually:

1. What went well
2. What improved
3. Next focus
4. Coach feedback
5. What felt difficult

Do not hide "What felt difficult".

However, do not make negative/difficult information visually dominate the confidence page.

Maintain honest evidence rather than forced positivity.

# Confidence display

Make before/after confidence visually understandable.

Prefer something concise such as:

Confidence
3 / 5 → 4 / 5

with secondary labels:

Before
After

or:

3 / 5 before → 4 / 5 after

Ensure screen readers can understand the meaning.

Do not rely only on arrow colour.

# Missing confidence values

If a reflection exists but one/both confidence ratings are missing:

Do not show misleading:

0 / 5

or:

— → —

Instead either:

- show only the available value
or
- omit the comparison and display the reflection normally.

# 13. Confidence summary cards

Review existing summary cards.

Make sure card labels are understandable to an athlete.

Avoid ambiguous wording.

For example:

"Reflected sessions"
may not be immediately obvious.

Consider clearer wording such as:

"Sessions reflected on"

or:

"Sessions with reflections"

Similarly:

"Higher after training"

should include sufficient context.

Example:

"Confidence higher after"
5 of 7 sessions

Do not overcomplicate the summary.

Keep only metrics that are genuinely understandable and useful.

Do not add new backend calculations unless absolutely necessary.

# 14. Confidence filtering

Keep existing Confidence filtering functionality.

Do not remove it.

If Zustand currently persists the Confidence filter, preserve that behaviour.

Make sure the filter is visually separated from the page explanation so a new athlete
does not think filtering is the primary action.

# 15. Progress page context

Review the Progress page introduction.

Ensure it clearly explains:

"TrackRank reflects your engagement with the training process, not how fast you run."

Do not redesign the entire Progress page.

Only make minor wording/hierarchy improvements if necessary for consistency with the
new onboarding.

# 16. First-time empty-state philosophy

Review empty states on:

Dashboard
Sessions
Confidence
Progress where relevant

Every empty state should answer:

1. Why is this empty?
2. What should I do next?

Bad:

"No data."

Better:

"No sessions logged yet."

"Log your first training session to start building your training history."

Action:
"Log a session"

Do not make all empty states identical.

Each should be relevant to its page.

# 17. User-friendly terminology review

Audit visible UI copy touched by this milestone.

Avoid developer/database terminology.

Avoid:

record
entity
payload
completion object
confidence data
CRUD
API
MongoDB
database record

Prefer athlete language:

session
training
reflection
confidence
progress
history

Internal code terminology may remain technical.

# 18. Do not over-explain

Although this milestone adds onboarding, TrackRanker should not become text-heavy.

Prefer:

short headings
one-sentence explanations
clear buttons
visual hierarchy

over:

large instructional paragraphs.

The goal is clarity, not documentation inside the UI.

# Responsive behaviour

Test around:

390px width

and a normal desktop viewport.

Ensure:

- hero text wraps properly
- three-step explanation stacks cleanly
- primary actions remain obvious
- reflection cards do not overflow
- Confidence header remains readable
- filters remain usable
- no page-level horizontal scrolling
- navigation still works

# Accessibility

Ensure:

- one clear h1 per page
- heading hierarchy is logical
- actions have meaningful text
- reflection section labels use appropriate semantic structure
- confidence changes are understandable without colour
- links/buttons remain keyboard accessible
- focus states remain visible
- empty-state actions are descriptive
- navigation remains screen-reader friendly

# Backend

Prefer NO backend changes.

This milestone is about:

- information architecture
- copy
- frontend hierarchy
- navigation
- formatting

Do not modify database models.

Do not add endpoints.

Do not change confidence calculations.

Do not change XP calculations.

Do not change session-completion behaviour.

If a frontend requirement truly cannot be met without a backend change, make the
smallest possible change and explain why.

# Existing functionality to preserve

Do not break:

- Dashboard recent sessions
- TrackRank Dashboard summary
- Training-session CRUD
- Repeat Session if implemented
- streamlined session creation
- Zustand draft persistence if implemented
- session filters if implemented
- completion logging
- repetition results
- reflections
- confidence-history API
- confidence filtering
- confidence chart
- TrackRank XP
- achievements
- XP save feedback if implemented
- Progress page
- Scalar
- backend health check
- automated tests

# Frontend tests

Add/update meaningful tests covering at minimum:

## Dashboard

1. Dashboard explains that TrackRanker is for 100m/200m/400m sprinters.
2. Dashboard describes the core purpose of TrackRanker.
3. Three "How TrackRanker works" steps render.
4. Log a session links to /sessions/new.
5. Training history links to /sessions.
6. Log a session and Training history have clearly distinct labels.
7. Recent Training still renders.
8. Dashboard TrackRank summary still renders if currently implemented.

## Navigation

9. Profile is no longer shown in primary navigation.
10. Main navigation still exposes Dashboard, Sessions, Confidence, and Progress.
11. /profile behaves safely if someone manually navigates to it, if the route remains.

## Confidence page

12. New Confidence heading renders.
13. Supporting explanation makes the page purpose clear.
14. Empty state explains how to build confidence history.
15. Empty-state action routes correctly.
16. Confidence history entry displays session title and date.
17. Before/after confidence values are clearly rendered.
18. What went well renders only when populated.
19. Improved renders only when populated.
20. Next focus renders only when populated.
21. Coach feedback renders only when populated.
22. Empty reflection fields do not render unnecessary headings.
23. View session links correctly.
24. Partial confidence data renders without fake/zero values.
25. Existing session-type filtering still works.

## Regression

26. Existing Dashboard API failure state remains usable.
27. Existing Confidence API failure state remains usable.

Update exact test counts as appropriate.

Mock API calls.

Do not depend on a live backend.

# Documentation

Create:

specs/11-first-time-ux-clarity.md

Document:

- user feedback
- first-time usability problem
- Dashboard onboarding strategy
- three-step TrackRanker workflow
- distinction between Log a session and Training history
- Profile removal decision
- Confidence-page purpose
- reflection-card hierarchy
- empty-state philosophy
- terminology principles
- accessibility considerations
- responsive considerations
- deferred functionality

Create a design decision record:

specs/decisions/006-first-time-experience.md

Document:

Context:

TrackRanker had developed meaningful functionality, but first-time users could not
immediately understand what the product was or what action they should take.

Decision:

Prioritise first-time comprehension and clear workflow hierarchy before adding more
features.

Explain:

- Why the Dashboard is used as the onboarding surface.
- Why onboarding remains concise rather than using a tutorial modal.
- Why "Training history" is clearer than "View training".
- Why the unused Profile navigation is removed.
- Why Confidence is framed as evidence from previous training.
- Why blank reflection fields are omitted.
- Why clarity and navigation are being prioritised before further feature development.

# AI prompt evidence

Create:

specs/prompts/011-first-time-ux-clarity.md

Copy this COMPLETE prompt into that file exactly.

Do not modify previous prompt files.

Verify earlier prompt evidence remains unchanged.

# README

Only update README.md where factually useful.

Possible updates:

- clarify TrackRanker's product description
- mention the core user journey
- remove references to Profile if it is documented as active functionality

Do not rewrite unrelated assessment sections.

Do not alter advanced-requirement statuses unless their implementation status has
actually changed.

# Verification

Run:

npm test

npm run build

If no backend files were changed, backend tests do not need to be modified.

However, follow AGENTS.md if full project verification is required.

Also run:

git diff --check
git status

Perform:

- secret scan
- generated-file check
- prompt-integrity check

Ensure these are not accidentally tracked:

node_modules
dist
coverage
bin
obj

Do NOT stage anything.

Do NOT commit.

Do NOT push.

# Manual verification

If the app can run locally:

## First-time comprehension

1. Open Dashboard as though you have never used TrackRanker.
2. Confirm within the top portion of the page it is obvious:
   - TrackRanker is for sprinters
   - it involves logging training
   - reflection/confidence are part of the workflow
   - Log a session is the expected first action

## Actions

3. Select Log a session.
4. Confirm it goes directly to new-session creation.
5. Return.
6. Select Training history.
7. Confirm it shows previously logged sessions.

## Navigation

8. Confirm Profile is absent from primary navigation.
9. Confirm Dashboard, Sessions, Confidence and Progress still work.

## Confidence

10. Open Confidence with existing reflection data.
11. Confirm the page purpose is obvious before reading the individual entries.
12. Confirm reflection entries are easy to scan.
13. Confirm empty fields are omitted.
14. Confirm before/after confidence is understandable.
15. Confirm View session works.
16. Test a filter and confirm existing filtering remains functional.

## Empty states

17. Use tests or temporary data state to inspect empty Confidence experience.
18. Confirm it clearly explains what to do next.

## Mobile

19. Test Dashboard around 390px width.
20. Test Confidence around 390px width.
21. Confirm no horizontal overflow.
22. Confirm primary actions remain easy to identify.
23. Confirm reflection cards remain readable.

Do not create permanent data solely for visual verification unless necessary.

# Quality expectations

The key success criterion is:

A new athlete should understand TrackRanker quickly without someone explaining it.

Prefer:

clarity
simplicity
visual hierarchy
consistent terminology

over:

more features
more metrics
more cards
more text

Do not use this milestone as an excuse for a complete visual redesign.

TrackRanker should still feel like the same application, just substantially easier
to understand and use.

# Final response

When finished, report:

1. UX problems addressed.
2. Dashboard onboarding changes.
3. Primary-action changes.
4. Navigation/Profile decision.
5. Confidence-page changes.
6. Reflection-history formatting changes.
7. Empty-state improvements.
8. Terminology/copy improvements.
9. Accessibility improvements.
10. Responsive/mobile improvements.
11. Files created and modified.
12. Tests added/updated.
13. Commands run.
14. Exact test/build results.
15. Manual verification performed.
16. Any unresolved usability issues.
17. git status summary.
18. Recommended next milestone.

IMPORTANT:

Do NOT stage changes.
Do NOT create a commit.
Do NOT push.
Do NOT report a commit hash.

I will review and commit manually.