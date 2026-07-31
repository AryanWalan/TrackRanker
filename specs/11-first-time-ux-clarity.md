# First-time experience, navigation clarity, and Confidence UX

## User feedback and usability problem

TrackRanker had meaningful session, reflection, confidence, and progress features, but a first-time athlete could not quickly tell who the application was for, what it helped them do, or where to begin. The Dashboard actions looked too similar, Profile was a visible placeholder, and Confidence evidence was difficult to scan.

This milestone prioritises comprehension and information hierarchy without adding product features or changing backend behaviour.

## Dashboard onboarding strategy

The Dashboard is the concise orientation surface because it is already the application's default route. Its top section now states that TrackRanker is for 100m, 200m, and 400m sprinters and explains that athletes log coach-prescribed training, understand sessions, reflect, and build confidence from their own evidence.

Onboarding remains part of the Dashboard rather than a tutorial modal. It is always available, does not interrupt returning athletes, and requires no dismissed-state management.

## Three-step workflow

The Dashboard presents a short sequence:

1. **Log your session** — add the training session prescribed by the athlete's coach.
2. **Complete and reflect** — record what happened, what was learned, and confidence.
3. **Build confidence** — review training evidence, reflections, and progress.

The sequence appears before quick actions, TrackRank, system status, and recent training so the core workflow explains the application before secondary information.

## Primary-action distinction

**Log a session** is the primary action and routes to `/sessions/new`. Its supporting text describes creating today's or an upcoming session.

**Training history** is the secondary action and routes to `/sessions`. Its supporting text describes viewing, repeating, and managing sessions already logged.

Sessions-related creation wording now consistently uses **Log a session**, while the collection uses **Training history** or the established navigation label **Sessions**.

## Profile removal

Profile was a placeholder with no athlete value. It has been removed from primary navigation and its page component has been removed. A direct `/profile` visit redirects safely to the Dashboard. Athlete profiles remain deferred.

## Confidence purpose and guidance

The Confidence page is framed as **Your Confidence Evidence**. Its introduction explains that it uses previous sessions and that completing sessions with confidence ratings and short reflections builds the history.

When no evidence exists, the page retains this explanation and adds a focused **Build your confidence history** state with one primary route to existing sessions.

## Reflection-card hierarchy

Each evidence card prioritises:

1. Session title
2. Session type and date
3. Available before/after confidence values
4. What went well
5. What improved
6. Next focus
7. Coach feedback
8. What was difficult
9. View session

Only meaningful reflection fields render. Partial confidence displays only available ratings, never fabricated zeroes or empty placeholders. Text labels make the before/after meaning understandable without colour.

## Empty-state philosophy

Touched empty states explain both why content is absent and what the athlete should do next. Dashboard and Training history direct athletes to log their first session, while Confidence explains the completion/reflection behaviour needed to build evidence.

## Terminology principles

Visible copy uses athlete language: session, training, reflection, confidence, progress, and history. Developer-oriented API, database, payload, and record terminology is avoided in the normal interface. Instructions remain brief and action-led.

## Accessibility

- Each page has one clear `h1` and logical nested headings.
- Workflow steps use a semantic ordered list.
- Primary navigation retains an accessible label and visible focus states.
- Confidence comparisons include explicit before/after text.
- Reflection sections use headings and omit blank sections.
- Confidence helper text is programmatically associated with its select.
- Direct Profile navigation resolves safely rather than leaving a dead page.

## Responsive behaviour

The Dashboard workflow and actions collapse to one column at the existing mobile breakpoint. Confidence metadata, comparisons, reflection blocks, filters, and actions wrap without requiring page-level horizontal scrolling. Four primary navigation destinations fit more comfortably after Profile removal.

## Deferred functionality

Athlete profiles, tutorial modals, personalised onboarding, authentication, coach accounts, new Confidence calculations, backend changes, additional TrackRank rules, Cypress, and broader visual redesign remain deferred.
