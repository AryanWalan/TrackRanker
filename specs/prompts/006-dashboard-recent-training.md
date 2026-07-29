You are implementing a small focused TrackRanker improvement.

IMPORTANT:
- Do NOT run git add.
- Do NOT create a git commit.
- Do NOT push.
- I will stage and commit manually.
- Do not make unrelated architectural changes.
- Keep this intentionally small.

Before making changes:

1. Read AGENTS.md.
2. Review the existing Dashboard page.
3. Review the existing training-session API layer and TypeScript types.
4. Review the Sessions page and existing TrackRanker styling.
5. Review relevant frontend tests.
6. Preserve all previous /specs/prompts files unchanged.

# Goal

Improve the TrackRanker Dashboard so it provides useful navigation and a quick
snapshot of recent training.

Do not add new backend endpoints.

Use the existing training-session API.

# Dashboard design

The Dashboard should contain:

1. TrackRanker welcome/header area.
2. Two clear quick actions.
3. A recent training section.
4. Existing backend connection status, but make it visually secondary.

# Header

Keep:

TrackRanker

Tagline:

"Understand your training. Trust your progress."

Do not add large motivational paragraphs.

# Quick actions

Add two prominent actions:

"Log a session"
→ /sessions/new

"View training"
→ /sessions

These should look like useful dashboard actions rather than ordinary text links.

Ensure they are:

- keyboard accessible
- responsive
- consistent with the TrackRanker visual identity

# Recent training

Use the existing API that retrieves training sessions.

Display up to the 3 most recent sessions.

For each session display only useful summary information such as:

- Title
- Session type
- Date
- Prescription
- Status

Each item should link to:

/sessions/{id}

Do not display every stored field.

The purpose is quick scanning.

# Empty state

If there are no sessions, show:

"No sessions logged yet."

Supporting text:

"Add your first session to start building your training history."

Provide:

"Log your first session"

→ /sessions/new

# Loading state

While sessions are loading, show a simple intentional loading state.

Do not show raw text such as:

"Loading..."

if the existing UI has a better loading pattern.

Do not install a skeleton/loading dependency.

# Error state

If training sessions fail to load:

- The rest of the Dashboard must remain usable.
- Quick actions should still work.
- Show a concise message explaining that recent training could not be loaded.

Do not expose raw exception text.

# Backend health status

Preserve the existing backend health check.

Make it visually secondary.

It should not dominate the athlete-facing dashboard.

Use concise wording such as:

System connected

or

Connection unavailable

Do not expose technical API details to normal users.

# Responsive design

Desktop:

The quick actions may sit side-by-side.

Recent training should be easy to scan.

Mobile:

Actions should stack or size appropriately.

Recent-session cards must not overflow.

Keep touch targets comfortable.

# Accessibility

Ensure:

- semantic headings
- meaningful link text
- visible focus styles
- status information is understandable without colour alone
- loading/error content is accessible

# API usage

Reuse the existing frontend API function for retrieving training sessions.

Do NOT:

- create a new dashboard API endpoint
- call MongoDB directly
- duplicate API request logic
- change backend architecture

If the existing API layer already returns sessions newest-first, use that.

If not, sort safely on the frontend using SessionDate.

# Testing

Add or update frontend tests covering at minimum:

1. Dashboard renders TrackRanker title and tagline.
2. "Log a session" links to /sessions/new.
3. "View training" links to /sessions.
4. Recent sessions returned by the API are displayed.
5. Only the three most recent sessions are shown.
6. Recent session links point to the correct session-detail route.
7. Empty-session state renders correctly.
8. API failure still leaves quick actions usable.

Mock all API calls.

Do not require a live backend.

Do not add backend tests because there are no backend changes.

# Out of scope

Do NOT add:

- Confidence history
- Confidence analytics
- Charts
- Gamification
- XP
- Levels
- Achievements
- Streaks
- Authentication
- User accounts
- Personal bests
- Training recommendations
- AI functionality
- New backend endpoints
- Zustand
- Theme switching
- New security features
- Deployment changes
- Dependency upgrades

# Documentation

Create:

specs/06-dashboard-recent-training.md

Keep this document short.

Document:

- Dashboard purpose
- Quick actions
- Recent training behaviour
- Loading, empty and error states
- Why existing APIs were reused
- Explicitly deferred functionality

Create:

specs/prompts/006-dashboard-recent-training.md

Copy this COMPLETE prompt into that file exactly.

Do not modify earlier prompt evidence.

Only update README.md if the current Dashboard description is now factually outdated.

Do not rewrite unrelated README sections.

# Verification

Run from the frontend directory:

npm test

npm run build

Also run:

git diff --check
git status

Check that no generated files have become tracked.

Do NOT stage anything.

Do NOT commit anything.

# Manual verification

If the app can run locally:

1. Open the Dashboard with existing sessions.
2. Confirm up to three recent sessions appear.
3. Open one recent session.
4. Return to Dashboard.
5. Test "Log a session".
6. Test "View training".
7. Verify the Dashboard on a narrow/mobile viewport.
8. If practical, verify the empty state using mocked/test data.

# Final response

Report:

1. What changed.
2. Files created/modified.
3. Dashboard UX implemented.
4. Tests added/updated.
5. Commands run.
6. Exact test/build results.
7. Manual verification.
8. Any unresolved issues.
9. git status summary.

IMPORTANT:
Do NOT create a commit.
Do NOT stage changes.
Do NOT push.