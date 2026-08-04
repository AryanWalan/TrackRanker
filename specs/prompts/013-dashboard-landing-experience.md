You are implementing a major frontend UX milestone for TrackRanker.

Milestone: Dashboard Landing Experience and Visual Section System.

IMPORTANT:
- Do NOT run git add.
- Do NOT create a git commit.
- Do NOT push.
- I will stage and commit manually.
- This is a substantial visual and structural milestone.
- Do not add unrelated product features.
- Prefer no backend changes.
- Preserve all existing Dashboard functionality and API behaviour.

Before making changes:

1. Read AGENTS.md.
2. Read README.md.
3. Read all current Dashboard, onboarding, UX and architecture specifications.
4. Review:
   - DashboardPage
   - Dashboard tests
   - HealthStatus
   - navigation/header
   - Recent Training implementation
   - TrackRank Dashboard summary
   - application-wide styles
   - responsive breakpoints
5. Review the current landing page visually.
6. Review existing frontend test utilities and mocked APIs.
7. Preserve all previous files in specs/prompts unchanged.

# Current state

The TrackRanker Dashboard currently contains:

- TrackRanker hero introduction
- "How TrackRanker works"
- Log a session
- Training history
- TrackRank progress
- Recent training
- system/backend status

The content is useful, but it still feels like one long collection of cards inside a
single centred column.

Large pieces of information visually blend together.

As the athlete scrolls, it should feel like they are entering a new section with a
clear new purpose.

# Main goal

Redesign the Dashboard into a coherent scroll-based landing experience.

The user journey should feel like:

1. Understand what TrackRanker is.
2. Understand how it works.
3. Choose what to do next.
4. See personal training progress.
5. Review recent training.
6. See secondary system status.

Each significant idea should occupy its own visually distinct page section.

Do not create separate routes.

Do not turn the Dashboard into a long marketing website.

It must remain a functional application Dashboard.

# Required section order

Organise the Dashboard in this exact conceptual order:

1. Hero
2. How TrackRanker works
3. Start training
4. Your training progress
5. Recent training
6. System status

Preserve this information hierarchy on both desktop and mobile.

# Shared section system

Create a consistent reusable visual section system.

Each major Dashboard area should have:

- a semantic section element
- clear section heading
- optional short eyebrow label
- concise supporting text
- consistent horizontal content width
- deliberate vertical padding
- clear separation from neighbouring sections

Use alternating background treatments or subtle contrast changes.

For example:

Hero:
dark TrackRanker brand background

How it works:
light neutral background

Start training:
subtle contrasting background

Training progress:
dark or brand-accent background

Recent training:
light background

System status:
minimal footer-like treatment

Do not make every section look like an unrelated design.

They should feel like parts of one visual system.

# Page width behaviour

The current page has large white margins and all content sits inside a narrow central
stack.

Preferred approach:

- section backgrounds may span the full available page width
- section content remains constrained to a readable max width
- internal content aligns consistently between sections
- avoid making every section appear as a floating card

Use a structure conceptually similar to:

<section className="dashboard-section dashboard-section--light">
  <div className="dashboard-section__content">
    ...
  </div>
</section>

Exact naming may differ.

Do not add unnecessary layout libraries.

# 1. Hero section

The Hero should introduce TrackRanker immediately.

Preserve the essential content:

Eyebrow:
"For 100m, 200m and 400m sprinters"

Heading:
"TrackRanker"

Primary description:
"Training clarity and confidence for 100m, 200m and 400m sprinters."

Supporting copy:
"Log what your coach gives you, understand your sessions, reflect on how they went,
and build confidence from your own training."

Requirements:

- Keep the TrackRanker dark brand background.
- Preserve the existing track-inspired decorative visual if it remains effective.
- Improve spacing and alignment.
- Prevent decorative artwork from competing with text.
- Keep text readable at narrow widths.
- Avoid excessive hero height.
- Do not repeat the same TrackRanker explanation elsewhere immediately below it.
- Add a clear primary action if it improves usability:

  "Log a session"
  → /sessions/new

- An optional secondary text link may be:

  "View training history"
  → /sessions

Do not overcrowd the hero with progress metrics.

# 2. How TrackRanker works section

This should feel like the next chapter when scrolling.

Heading:
"How TrackRanker works"

Eyebrow:
"Start here"

Use exactly these steps:

1. Log your session

"Add the training session your coach has prescribed."

2. Complete and reflect

"Record how the session went, what you learned, and how confident you felt."

3. Build confidence

"Look back at your training evidence, reflections, and progress."

Requirements:

- Present the steps as a clear journey.
- Desktop: use a balanced horizontal three-step layout.
- Mobile: stack the steps vertically.
- Keep visible numbered markers.
- Add a subtle connector between steps on desktop if it improves comprehension.
- Do not turn each step into a large heavy card.
- Use generous whitespace.
- Maintain readable line lengths.
- Do not add animation.

The section should be understandable in a few seconds.

# 3. Start training section

Create a distinct action-focused section.

Eyebrow:
"Take action"

Heading:
"Start training"

Supporting copy:
"Log what you're doing today or look back at sessions you've already recorded."

Include two actions:

## Primary

"Log a session"

Supporting text:
"Add today's or an upcoming training session."

Route:
/sessions/new

## Secondary

"Training history"

Supporting text:
"View, repeat, and manage sessions you've already logged."

Route:
/sessions

Requirements:

- Make Log a session clearly primary.
- Make Training history clearly secondary.
- Both actions should remain easy to understand without relying only on colour.
- The action blocks should have hover and keyboard-focus states.
- Desktop: they may sit side-by-side.
- Mobile: stack cleanly.
- Keep touch targets comfortable.
- Do not make the two actions visually indistinguishable.
- Do not duplicate the Recent Training list in this section.

# 4. Your training progress section

Give TrackRank its own visual chapter.

Eyebrow:
"Training process"

Heading:
"Your training progress"

Supporting text:
"TrackRank rewards completing sessions, reflecting, and checking in with your confidence."

Preserve the existing TrackRank Dashboard summary.

The section should continue displaying, where available:

- Current TrackRank
- Total XP
- Current-rank progress
- View progress action

Preserve the explanation:

"TrackRank reflects engagement with your training process, not sprint ability."

Requirements:

- Do not change XP calculations.
- Do not change API calls.
- Do not add new metrics.
- Do not add new achievements.
- Make the TrackRank value visually prominent.
- Keep progress indicators accessible.
- Show the API error state without making the entire section look broken.
- If progress is unavailable, use concise athlete-facing text.
- The rest of the Dashboard must remain usable.

Do not make gamification dominate the full Dashboard.

# 5. Recent training section

Create a clear training-history snapshot section.

Eyebrow:
"Training snapshot"

Heading:
"Recent training"

Supporting text:
"Quickly return to your latest logged sessions."

Preserve existing behaviour:

- Load sessions from the existing API.
- Sort newest-first.
- Display no more than three.
- Show title, type, date, prescription and status.
- Link each card to its session detail page.
- Preserve loading, empty and error states.

Visual requirements:

- Cards should feel like concise session summaries.
- Do not display every session field.
- Improve visual separation between:
  - title
  - metadata
  - prescription
  - status
- Avoid excessive card height.
- Keep long prescriptions wrapping correctly.
- Cards should work at approximately 390px width.
- Do not create a horizontal carousel.

Empty state should include:

"No sessions logged yet."

Supporting text:
"Log your first training session to start building your training history."

Action:
"Log a session"

Error state should leave the rest of the section and Dashboard understandable.

# 6. System status section

Move system connection information to the bottom of the Dashboard.

Treat it like secondary application status rather than an athlete feature.

Use concise language:

"System connected"

or:

"Connection unavailable"

Requirements:

- Do not expose API URLs.
- Do not mention HTTP status codes.
- Do not mention MongoDB.
- Keep the status visually quiet.
- Do not use a large standalone card.
- Ensure screen readers can understand current status.
- Preserve existing health-check behaviour.

# Dashboard component architecture

The current Dashboard page may become too large after this milestone.

Refactor it into focused presentational components where useful.

Possible components:

- DashboardHero
- HowItWorksSection
- StartTrainingSection
- TrainingProgressSection
- RecentTrainingSection
- DashboardSystemStatus
- DashboardSection

Do not create components solely to wrap two lines of markup.

Prefer a clear balance between:

- readable DashboardPage orchestration
- focused section components
- reusable visual primitives

Keep API-loading responsibility understandable.

Do not introduce a state-management rewrite.

If Zustand is already implemented, do not move Dashboard server data into Zustand.

# Visual identity

Preserve the current TrackRanker identity:

- dark navy
- white
- orange/red accent
- lime/yellow-green accent
- track-inspired shapes
- bold athletic typography

Improve consistency.

Do not introduce unrelated colours.

Do not use gradients unless they already exist and remain subtle.

Do not make the page glossy.

Do not imitate a generic fitness template.

Avoid:

- excessive shadows
- excessive rounded cards
- multiple competing accent colours
- decorative elements behind body text
- huge blank full-screen areas
- generic stock imagery

# Scroll rhythm

The user should clearly feel transitions between sections.

Use:

- generous but controlled vertical padding
- alternating backgrounds
- section boundaries
- consistent section introductions
- intentional whitespace

Do not use:

- scroll snapping
- parallax
- automatic scrolling
- scroll-triggered animations
- sticky full-page panels
- third-party animation libraries

Normal browser scrolling should remain predictable.

# Header/navigation integration

Preserve the existing header and official TrackRanker logo.

Do not redesign the full navigation in this milestone.

Ensure:

- Dashboard active state remains clear
- header does not visually compete with the Hero
- Hero begins cleanly below the navigation
- no accidental doubled dark bands without separation
- mobile navigation behaviour remains functional

# Responsive design

Test at minimum:

- approximately 390px mobile width
- tablet width
- normal desktop width
- wide desktop width

Requirements:

- no document-level horizontal overflow
- hero text remains readable
- decorative artwork does not cover content
- workflow steps stack cleanly
- actions stack cleanly
- TrackRank summary remains readable
- recent-session cards fit
- section spacing reduces appropriately on mobile
- navigation remains usable

Do not use fixed pixel widths that only work for the current screenshot.

# Accessibility

Ensure:

- one clear h1 on the Dashboard
- logical h2 hierarchy for major sections
- semantic section elements
- sections use labelled headings where appropriate
- links have meaningful text
- progress indicators have accessible labels
- system-status changes are conveyed textually
- colour is not the only indicator of state
- focus styles remain visible
- decorative visuals are hidden from assistive technologies where appropriate
- sufficient colour contrast
- motion is not introduced

# Loading behaviour

Avoid the page visually jumping excessively as API data loads.

Do not add a skeleton dependency.

Use lightweight placeholders or stable minimum structure where practical.

The Hero, workflow and Start Training sections should render immediately without
waiting for API calls.

Progress and Recent Training should load independently.

One failed API request must not prevent the other section from rendering.

# Error behaviour

Preserve independent failure handling.

Examples:

Progress fails:
- Start Training and Recent Training still work.

Sessions fail:
- TrackRank and actions still work.

Health fails:
- only system status changes.

Do not create one global Dashboard error screen.

Do not expose raw exception messages.

# Testing requirements

Update or add focused frontend tests.

Cover at minimum:

## Structure and hierarchy

1. Dashboard renders the Hero heading.
2. Hero explains TrackRanker is for 100m, 200m and 400m sprinters.
3. Major sections render in the intended order:
   - Hero
   - How TrackRanker works
   - Start training
   - Your training progress
   - Recent training
   - System status
4. Each major section has an accessible heading.

## Workflow

5. All three workflow steps render.
6. Steps render in the correct logical order.
7. Supporting workflow descriptions remain present.

## Actions

8. Log a session links to /sessions/new.
9. Training history links to /sessions.
10. The two actions retain distinct labels.
11. Hero CTA works if included.

## Progress

12. TrackRank summary still renders from successful API data.
13. Progress failure does not remove other Dashboard content.
14. View progress links to /progress.

## Recent training

15. Up to three newest sessions render.
16. Session cards link correctly.
17. Empty state renders.
18. Session API failure leaves primary actions usable.

## System status

19. Successful health status uses athlete-facing wording.
20. Failed health status uses athlete-facing wording.
21. Technical API details are not shown.

## Regression

22. Existing Dashboard navigation remains usable.
23. Official TrackRanker logo remains present.
24. No Profile navigation is reintroduced.

Mock API calls.

Do not depend on a live backend.

Do not remove existing useful Dashboard test coverage.

# Backend

Prefer NO backend changes.

Do not:

- add endpoints
- change DTOs
- change MongoDB data
- change TrackRank rules
- change confidence calculations
- change session sorting in the API
- change health behaviour

If a backend change is genuinely required, keep it minimal and report why.

# Existing functionality to preserve

Do not break:

- session CRUD
- session creation draft
- session filters
- streamlined create form
- Repeat Session if implemented
- completion logging
- reflections
- confidence history
- confidence filtering
- TrackRank XP
- achievements
- Progress page
- Dashboard API calls
- official logo/favicon
- navigation
- Scalar
- automated tests

# Out of scope

Do NOT implement:

- Cypress
- rate limiting
- new security work
- authentication
- user accounts
- coach accounts
- theme switching
- WebSockets
- Storybook
- Docker changes
- deployment changes
- new gamification
- notifications
- AI-generated content
- new session analytics
- personal bests
- scroll animations
- new charting libraries
- unrelated dependency upgrades
- React Router forced audit changes

# Documentation

Create:

specs/13-dashboard-landing-experience.md

Document:

- visual problem addressed
- intended scroll journey
- section hierarchy
- shared section system
- Hero purpose
- How-it-works presentation
- Start Training action hierarchy
- TrackRank placement
- Recent Training placement
- system-status treatment
- responsive design
- accessibility
- independent loading/error states
- explicitly deferred features

Create a design decision record:

specs/decisions/008-scroll-section-dashboard.md

Document:

Context:

The Dashboard contained the correct information but presented it as one continuous
stack of similarly weighted cards.

Decision:

Structure the Dashboard as distinct scroll sections, each introducing one major idea.

Explain:

- why distinct sections improve first-time comprehension
- why section backgrounds may span full width while content remains constrained
- why normal scrolling is preferred over scroll snapping or animation
- why the Dashboard remains an application rather than a marketing website
- why system status is moved to the bottom
- why TrackRank appears after the main workflow and actions
- trade-offs

# AI prompt evidence

Create:

specs/prompts/013-dashboard-landing-experience.md

Copy this COMPLETE prompt into that file exactly.

Do not modify previous prompt evidence.

Verify all earlier prompt files remain unchanged.

# README

Update README.md only where factually useful.

Possible update:

- mention the Dashboard onboarding and sectioned first-time experience

Do not rewrite unrelated sections.

Do not change advanced-requirement statuses.

# Verification

Run:

npm test
npm run build

Follow AGENTS.md for any additional required frontend checks.

Also run:

git diff --check
git status

Perform:

- secret scan
- generated-file scan
- prompt-integrity check

Ensure these have not accidentally become tracked:

node_modules
dist
coverage
bin
obj
cypress/screenshots
cypress/videos

Do NOT stage.
Do NOT commit.
Do NOT push.

# Manual verification

Run the application locally where possible.

Verify:

## Desktop

1. Open Dashboard at a normal desktop size.
2. Confirm Hero is the clear first section.
3. Scroll and confirm each major idea feels like a new section.
4. Confirm no section looks accidentally merged with its neighbour.
5. Confirm all actions work.
6. Confirm TrackRank data appears.
7. Confirm Recent Training appears.
8. Confirm system status is visually secondary.

## Mobile

9. Test around 390px width.
10. Confirm Hero artwork does not overlap text.
11. Confirm workflow steps stack.
12. Confirm actions stack.
13. Confirm progress content fits.
14. Confirm session cards fit.
15. Confirm no horizontal overflow.
16. Confirm touch targets remain comfortable.

## Data states

17. Verify successful progress and session data.
18. Verify Progress API failure state.
19. Verify Recent Training API failure state.
20. Verify true empty Recent Training state.
21. Confirm the rest of the Dashboard remains usable in each state.

## Accessibility

22. Navigate through Dashboard actions using keyboard only.
23. Confirm visible focus states.
24. Inspect heading order.
25. Confirm progress and status information have readable text alternatives.

Do not create permanent records solely for layout verification unless necessary.

# Quality expectations

The success criterion is:

As the athlete scrolls, each major section should introduce one clear new idea.

The page should feel more deliberate, spacious and understandable without becoming
longer through unnecessary text.

Prefer:

- hierarchy
- rhythm
- consistent alignment
- section contrast
- readable spacing

over:

- more cards
- more copy
- more decoration
- animation
- new features

# Final response

When finished, report:

1. UX problem addressed.
2. New Dashboard section structure.
3. Shared section/layout architecture.
4. Hero changes.
5. How-it-works changes.
6. Start Training changes.
7. TrackRank section changes.
8. Recent Training changes.
9. System-status changes.
10. Responsive behaviour.
11. Accessibility improvements.
12. Files created and modified.
13. Tests added or updated.
14. Commands run.
15. Exact test/build results.
16. Manual verification performed.
17. Any unresolved visual/usability issues.
18. git status summary.
19. Recommended next milestone.

IMPORTANT:

Do NOT stage changes.
Do NOT create a commit.
Do NOT push.
Do NOT report a commit hash.

I will review and commit manually.