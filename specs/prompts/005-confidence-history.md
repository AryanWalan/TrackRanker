You are implementing Milestone 5 of TrackRanker.

IMPORTANT:
- Do NOT run git add.
- Do NOT create a git commit.
- Do NOT push anything.
- I will stage and commit the work manually.
- You may use git status and git diff for review.
- Implement only this milestone.
- Do not make unrelated architectural changes.

Before making changes:

1. Read AGENTS.md.
2. Read README.md.
3. Read all current /specs product, architecture, session, completion, and UX documents.
4. Review the current TrainingSession and SessionCompletion backend implementation.
5. Review the current frontend routes, Confidence placeholder page, session-detail UI, API layer, and tests.
6. Preserve all previous files in specs/prompts unchanged.

# Project context

TrackRanker is a training-clarity and confidence application designed specifically
for 100m, 200m and 400m sprinters.

Current implemented functionality includes:

- Training session CRUD.
- Streamlined session creation.
- Planned training information.
- Optional session clarity.
- Completed-session results.
- Individual repetition results.
- Post-session reflection.
- Coach feedback.
- Confidence before and after sessions.
- MongoDB persistence.
- React + TypeScript frontend.
- C# .NET 10 backend.
- Scalar API documentation.
- Automated frontend and backend tests.

# Milestone goal

Turn the existing Confidence placeholder page into a useful Confidence History page.

The page should help an athlete answer:

- How have I been feeling before training?
- Do I often feel better after training than before?
- What sessions have helped me feel confident?
- What positive things have I previously written about my training?
- What evidence do I already have that I can handle difficult sessions?

This milestone must use REAL STORED SESSION DATA.

Do not generate fake motivational statements.

Do not add AI-generated encouragement.

Do not introduce gamification yet.

# Product philosophy

TrackRanker should build confidence using evidence.

An athlete may feel unconfident before a session even when their previous training
shows that they are capable.

The Confidence page should therefore surface previous evidence without making
psychological or medical claims.

Good language:

"You rated your confidence higher after this session."

"You've completed 8 reflected sessions."

"4 of your last 6 recorded sessions ended with higher confidence than they started."

"Previous reflection: Stayed relaxed through the final repetitions."

Avoid:

"You are becoming mentally stronger."

"Your confidence problem is improving."

"You are guaranteed to perform well."

"You should ignore your doubts."

The application reports data. It does not diagnose the athlete.

# Data source

Use existing:

TrainingSession
SessionCompletion
SessionReflection

Do NOT create a new Confidence MongoDB collection.

Confidence history should be derived from existing stored completion records.

Do not duplicate confidence data.

# Backend goal

Create a dedicated read-only confidence history endpoint.

Suggested endpoint:

GET /api/confidence/history

Return completed sessions that contain meaningful confidence/reflection information.

The response should combine the information required by the frontend without exposing
MongoDB domain models directly.

Use DTOs.

# Confidence history response

Create an appropriate response shape containing an overall summary and entries.

For example:

ConfidenceHistoryResponse
- TotalReflectedSessions
- SessionsWithConfidence
- SessionsImproved
- AverageConfidenceBefore
- AverageConfidenceAfter
- Entries

Each entry may contain:

- TrainingSessionId
- SessionTitle
- SessionType
- SessionDate
- ConfidenceBefore
- ConfidenceAfter
- WentWell
- Improved
- WasDifficult
- NextFocus
- CoachFeedback

Do not include fields the page does not need.

# Summary calculations

Derive calculations server-side.

TotalReflectedSessions:

Number of session completions containing at least one meaningful reflection or
confidence value.

SessionsWithConfidence:

Number where BOTH ConfidenceBefore and ConfidenceAfter are recorded.

SessionsImproved:

Number where:

ConfidenceAfter > ConfidenceBefore

AverageConfidenceBefore:

Average only sessions where ConfidenceBefore exists.

AverageConfidenceAfter:

Average only sessions where ConfidenceAfter exists.

Use appropriate nullable values when no data exists.

Round averages sensibly for display, for example one decimal place.

Do not invent values when data is missing.

# Confidence delta

For individual entries:

If both confidence ratings are present, the frontend may calculate/display:

ConfidenceAfter - ConfidenceBefore

Or include a derived delta in the API response if that better matches the current architecture.

Use simple labels:

+2
+1
No change
-1

Do not label negative changes as failures.

A lower post-session confidence rating is legitimate athlete data.

# Repository/service architecture

Follow the existing architecture.

Prefer reusing TrainingSessionRepository and SessionCompletionRepository rather than
creating duplicate MongoDB query logic.

If an efficient read-specific repository method is needed, add it cleanly.

Keep:

Controller → Service → Repository

Keep controllers thin.

Do not query MongoDB directly from controllers.

Do not expose internal MongoDB documents through the API.

Use async operations.

# Missing and partial data

The page must handle incomplete reflection data correctly.

Examples:

ConfidenceBefore exists but ConfidenceAfter does not:
- Include the entry if meaningful reflection content exists.
- Do not calculate a delta.

No confidence ratings but WentWell exists:
- Include it as reflection evidence.

No reflection and no confidence:
- Do not display it as confidence-history evidence.

Do not manufacture placeholders in the API.

# Ordering

Return history in chronological usefulness order:

Newest session first.

Use SessionDate primarily.

Use a stable secondary ordering if needed.

# API states

GET /api/confidence/history

Expected:

200 OK

Return an empty history response when there is no confidence data.

Do NOT return 404 just because the athlete has not logged reflections yet.

Example empty concept:

{
  "totalReflectedSessions": 0,
  "sessionsWithConfidence": 0,
  "sessionsImproved": 0,
  "averageConfidenceBefore": null,
  "averageConfidenceAfter": null,
  "entries": []
}

# Frontend route

Use the existing:

/confidence

Replace the placeholder implementation.

Do not create unnecessary additional routes.

# Confidence page structure

Build the page in roughly this order:

1. Page heading
2. Short explanation
3. Confidence summary
4. Evidence/history
5. Empty state

Suggested heading:

Confidence

Suggested supporting text:

"Look back at the sessions you've completed and the evidence you've built."

Keep copy concise.

# Summary section

Show useful high-level information.

Possible cards:

Reflected sessions
8

Higher after training
5 of 7

Average before
3.1 / 5

Average after
3.8 / 5

Only display metrics when meaningful.

For example:

If no confidence ratings exist, do not display misleading averages.

Avoid making the page look like a finance dashboard.

Keep the athlete-focused design.

# Confidence visualisation

Add ONE lightweight confidence visualisation.

Prefer a simple chart showing:

Confidence Before vs Confidence After

over time.

Each point corresponds to a completed session.

Requirements:

- Only include sessions where the corresponding value exists.
- Clearly distinguish Before and After.
- Y-axis range should represent 1–5.
- X-axis should represent session date.
- Must be responsive.
- Must remain understandable without relying exclusively on colour.
- Include accessible supporting text or labels.

Before adding a chart dependency:

Check existing dependencies.

If a lightweight chart solution already exists, use it.

If no chart package exists, prefer a straightforward implementation that does not
add a large dependency solely for one simple chart.

Do not add a chart library without a clear reason.

Do not create multiple charts.

# Evidence history

Below the summary/chart, display chronological session evidence.

Each entry should make it easy to scan:

Session title
Session type
Date

Confidence:

Before: 2 / 5
After: 4 / 5
Change: +2

Then display only reflection fields that contain actual content.

Prioritise:

What went well

What improved

Coach feedback

Next focus

"Was difficult" may also appear but should not visually dominate the positive evidence.

Do not hide difficult-session reflections.

The purpose is honest evidence, not forced positivity.

# Evidence cards

The historical entries should not look like giant forms.

Use compact readable cards or timeline entries.

Example concept:

Speed Endurance — 3 × 150m
12 August

Confidence
2 → 4

What went well
"Stayed relaxed through the final 50m."

Improved
"Times were more consistent than last week."

Coach feedback
"Good rhythm."

The exact visual design should follow the existing TrackRanker identity.

# Filtering

Add lightweight filtering.

Allow filtering history by:

- All
- Acceleration
- Max Velocity
- Speed Endurance
- Other existing session types

IMPORTANT:

Use ONLY session types currently supported by TrackRanker.

Do not invent enum values.

Do not add backend filter parameters unless they provide a clear architectural benefit.

For the expected project scale, client-side filtering is acceptable.

Do not add search, complex date ranges, sorting menus, or advanced filtering.

# Confidence evidence interaction

A history entry should link back to its original session detail page.

Example:

"View session"

Route:

/sessions/{id}

This reinforces that confidence evidence comes from actual training.

# Empty state

When there is no reflection/confidence data, display a useful empty state.

Suggested concept:

"No confidence history yet."

"Complete a session and add a short reflection to start building evidence from your training."

Provide an action:

"View sessions"

Do not shame the athlete for not having data.

Do not show zero-filled charts.

# Partial-data state

If reflections exist but no before/after confidence ratings exist:

Still show reflection evidence.

Explain concisely that confidence comparisons will appear once before and after
ratings are logged.

Do not hide useful reflection content.

# Mobile design

This page is particularly likely to be used on a phone after training.

Ensure:

- Summary cards fit narrow screens.
- Chart is readable on mobile.
- Evidence cards do not overflow.
- Long reflection text wraps correctly.
- Filters are usable without horizontal overflow where practical.
- Links/buttons have reasonable touch targets.

# Accessibility

Ensure:

- Semantic headings.
- Chart has an accessible textual description.
- Filters are accessible.
- Focus states remain visible.
- Confidence changes are not communicated using colour alone.
- Links have meaningful names.
- Dates and values remain readable by screen readers.

# API layer

Extend the existing typed frontend API layer.

Add types such as:

ConfidenceHistory
ConfidenceHistoryEntry

Add a function such as:

getConfidenceHistory()

Do not call fetch directly from the Confidence page if the existing architecture
uses a central API module.

# Backend tests

Add meaningful tests covering at minimum:

1. Empty history returns HTTP 200 and empty summary.
2. Reflected sessions are included.
3. Sessions with neither reflection nor confidence are excluded.
4. SessionsImproved counts only ConfidenceAfter > ConfidenceBefore.
5. Equal confidence does not count as improvement.
6. Missing confidence values do not break calculations.
7. Average confidence before is calculated correctly.
8. Average confidence after is calculated correctly.
9. History is ordered newest first.
10. Reflection fields are returned with their corresponding training session information.

Do not require live MongoDB for normal unit tests.

# Frontend tests

Add meaningful tests covering at minimum:

1. Confidence page renders loading state.
2. Empty history displays appropriate empty state.
3. Summary metrics render from API data.
4. Confidence before/after values display correctly.
5. Positive delta displays correctly.
6. Negative or unchanged confidence displays neutrally.
7. Reflection evidence renders.
8. Session-type filter filters entries.
9. View-session link routes to the correct session.
10. Partial data without confidence ratings renders gracefully.
11. API failure displays an error state.
12. Chart/visualisation receives/displays the expected confidence information.

Mock API calls.

Do not depend on a live backend.

# Existing functionality

Do not break:

- Dashboard.
- Sessions list.
- Session creation.
- Session editing.
- Session deletion.
- Session completion.
- Completion editing.
- Completion deletion.
- Health endpoint.
- Scalar.
- Existing responsive navigation.
- Existing tests.

# Out of scope

Do NOT implement:

- Gamification.
- XP.
- Levels.
- Achievements.
- Badges.
- Streaks.
- Authentication.
- User accounts.
- Multiple athlete profiles.
- Coach accounts.
- Coach messaging.
- AI-generated encouragement.
- AI-generated confidence analysis.
- Psychological assessments.
- Training recommendations.
- Injury recommendations.
- Race predictions.
- Personal-best tracking.
- Confidence goals.
- Notifications.
- WebSockets.
- Zustand.
- Theme switching.
- Rate limiting.
- Deployment changes.
- Docker changes.
- Unrelated dependency upgrades.
- React Router advisory work.

# Documentation

Create:

specs/05-confidence-history.md

Document:

- Purpose.
- Why confidence evidence uses existing completion data.
- Summary calculations.
- Inclusion/exclusion rules.
- Handling missing confidence data.
- History ordering.
- Filtering.
- Visualisation choice.
- Accessibility considerations.
- Empty state.
- Product language principles.
- Explicitly deferred functionality.

Create a design decision record:

specs/decisions/003-evidence-based-confidence.md

Document:

Context:
TrackRanker's primary differentiator is helping athletes trust themselves and their
training process.

Decision:
Confidence features should primarily surface evidence from athletes' own completed
sessions and reflections rather than generic motivational content.

Explain:

- Why personal evidence is more relevant than generic quotes.
- Why TrackRanker avoids psychological conclusions.
- Why difficult/negative data is not hidden.
- Why confidence history derives from SessionCompletion instead of creating duplicate
  confidence records.
- Trade-offs.

Update:

README.md

Only relevant sections.

Update:

specs/00-product-brief.md

Only where necessary.

Update:

specs/01-technical-architecture.md

Document the confidence-history read flow if needed.

Do not unnecessarily rewrite previous documents.

# AI prompt evidence

Create:

specs/prompts/005-confidence-history.md

Copy this COMPLETE prompt into that file exactly.

Do not modify any earlier prompt evidence.

Verify prompts 001–004 remain unchanged.

# Verification

Run:

dotnet build backend\TrackRanker.slnx

dotnet test backend\TrackRanker.slnx --no-build

From the frontend directory:

npm test

npm run build

Also run:

git diff --check

Review:

git status

Perform a basic secret scan.

Confirm generated files such as:

node_modules
bin
obj
dist
coverage

have not accidentally become tracked.

Do NOT run git add.

Do NOT commit.

# Manual verification

If the environment is available:

1. Open /confidence with no relevant data and inspect the empty state.
2. Create/identify multiple training sessions.
3. Add completions with different confidence-before and confidence-after values.
4. Include at least one session where confidence increases.
5. Include one where it stays unchanged or falls.
6. Include reflection content.
7. Open /confidence.
8. Confirm summary calculations match the stored data.
9. Confirm chart/history order is correct.
10. Filter by session type.
11. Confirm reflection evidence is readable.
12. Follow "View session" back to the original session.
13. Verify a narrow/mobile viewport.
14. Restart the API and confirm the page still uses persisted MongoDB data.
15. Clean up any temporary verification records if appropriate.

If live persistence verification cannot be performed, report the gap clearly.

# Quality expectations

- Do not fabricate confidence evidence.
- Do not use manipulative motivational copy.
- Prefer useful athlete information over excessive dashboard metrics.
- Keep the page visually calm and easy to scan.
- Reuse existing architecture.
- Avoid broad refactors.
- Do not weaken tests.
- Do not suppress warnings.
- Do not report commands as successful unless they actually passed.
- Keep this milestone focused on confidence history.

# Final response

When finished, report:

1. Feature summary.
2. Files created and modified.
3. Backend confidence-history architecture.
4. API response design.
5. Summary calculations implemented.
6. Confidence visualisation implemented.
7. Reflection/evidence history UX.
8. Filtering implementation.
9. Accessibility work.
10. Backend tests added.
11. Frontend tests added.
12. Commands run.
13. Exact build/test results.
14. Manual verification performed.
15. Any warnings or unresolved issues.
16. git status summary.
17. Recommended next milestone.

IMPORTANT:

Do NOT create a commit.
Do NOT stage changes.
Do NOT push.
Do NOT report a commit hash.

I will review and commit manually.