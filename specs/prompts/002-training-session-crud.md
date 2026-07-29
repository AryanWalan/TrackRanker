Read AGENTS.md, README.md, and all current files under /specs before making changes.

We are continuing development of TrackRanker.

The existing scaffold is complete and committed as:

3c73d9b72a7f0c70048cce92fe704e4acde0819b
chore: initialise TrackRanker full-stack scaffold

This task is Milestone 2.

# Goal

Implement the first complete vertical feature for TrackRanker:

TRAINING SESSION CRUD

An athlete must be able to:

- Create a sprint training session
- View all training sessions
- View one training session
- Edit a training session
- Delete a training session

This milestone should work end-to-end:

React frontend
    ↓
.NET 10 API
    ↓
MongoDB

Do not implement authentication, athlete accounts, confidence tracking, session results, achievements, XP, streaks, AI-generated advice, or other future features yet.

Keep this milestone focused.

# Product context

TrackRanker is designed for 100m, 200m and 400m sprinters.

One of the main problems TrackRanker is trying to solve is lack of clarity around training sessions.

A sprinter may receive something such as:

3 x 30m block starts
4 x 60m accelerations
3 x 150m @ 90%
2 sets of 20m - 30m - 30m - 20m

but may not fully understand:

- Why they are doing it
- What adaptation or skill it targets
- What they should focus on
- What completing the session successfully actually means

For that reason, a TrainingSession should store both the training prescription and its intended purpose.

# Training session model

Create a TrainingSession MongoDB document.

Use a clean domain model internally.

Suggested fields:

Id
Title
SessionType
SessionDate
Prescription
Purpose
FocusCue
SuccessCriteria
IntendedIntensity
CoachNotes
Status
CreatedAtUtc
UpdatedAtUtc

# Field requirements

Id:
- MongoDB ObjectId represented appropriately in the backend
- Expose IDs to the frontend as strings

Title:
- Required
- Trim whitespace
- Maximum 100 characters

SessionType:
Use a controlled enum or equivalent.

Initial valid values:

- Acceleration
- MaxVelocity
- SpeedEndurance
- SpecialEndurance
- Tempo
- Starts
- Competition
- Recovery
- Other

SessionDate:
- Required

Prescription:
- Required
- Maximum 1000 characters

Example:
"3 sets of 4 x 60m @ 80%, 90 sec between reps, 6 min between sets"

Purpose:
- Optional
- Maximum 1000 characters

Example:
"Develop speed endurance while maintaining relaxed sprint mechanics."

FocusCue:
- Optional
- Maximum 500 characters

Example:
"Stay relaxed through the shoulders and maintain rhythm."

SuccessCriteria:
- Optional
- Maximum 500 characters

Example:
"Complete all repetitions with consistent mechanics and controlled drop-off."

IntendedIntensity:
- Optional integer
- 0 to 100
- Represents intended percentage effort

CoachNotes:
- Optional
- Maximum 1000 characters

Status:
Use a controlled value.

Valid values:

- Planned
- Completed
- Cancelled

New sessions should default to Planned unless explicitly provided.

CreatedAtUtc:
- Set by the backend
- Never accepted from create requests

UpdatedAtUtc:
- Set by the backend
- Update whenever the session is modified

# Backend architecture

Keep the architecture clean.

Use:

Controllers
Services
Repositories
Models
DTOs
Validation where appropriate

Expected general structure:

TrackRanker.Api/
├── Controllers/
├── Models/
├── DTOs/
├── Repositories/
├── Services/
├── Configuration/
└── ...

Do not expose MongoDB persistence models directly as external API request contracts.

Use separate DTOs for:

CreateTrainingSessionRequest
UpdateTrainingSessionRequest
TrainingSessionResponse

You may add supporting DTOs when useful.

# Repository layer

Create an abstraction such as:

ITrainingSessionRepository

and a MongoDB implementation such as:

MongoTrainingSessionRepository

The repository should handle MongoDB persistence only.

It should support operations equivalent to:

GetAllAsync
GetByIdAsync
CreateAsync
UpdateAsync
DeleteAsync

Register dependencies through dependency injection.

Use asynchronous MongoDB APIs.

Do not place MongoDB queries directly in the controller.

# Service layer

Create:

ITrainingSessionService
TrainingSessionService

The service should handle application-level operations and mapping between persistence models and response DTOs.

Controllers must remain thin.

Do not add unnecessary abstraction beyond what is useful for this feature.

# MongoDB collection

Use a collection named:

trainingSessions

Do not create unrelated collections.

# API endpoints

Create:

GET /api/training-sessions

Returns all training sessions.

Sort them by SessionDate descending by default.

---

GET /api/training-sessions/{id}

Returns one session.

Return:

200 when found
404 when not found
400 for a malformed ID where appropriate

---

POST /api/training-sessions

Creates a session.

Return:

201 Created

Use CreatedAtAction or an equivalent REST-friendly response.

The response should contain the created TrainingSessionResponse.

---

PUT /api/training-sessions/{id}

Updates a session.

Return:

200 with the updated session when successful
404 when the session does not exist
400 for invalid data

Do not allow clients to modify:

Id
CreatedAtUtc

---

DELETE /api/training-sessions/{id}

Deletes a session.

Return:

204 No Content when successful
404 when the session does not exist

# Validation

Implement server-side validation.

At minimum validate:

- Required Title
- Title max length
- Required SessionDate
- Required Prescription
- Prescription max length
- Purpose max length
- FocusCue max length
- SuccessCriteria max length
- CoachNotes max length
- IntendedIntensity between 0 and 100
- Valid SessionType
- Valid Status

Return useful validation errors.

Do not rely only on frontend validation.

# Backend tests

Add meaningful automated tests.

Do not require a live MongoDB instance for service/controller unit tests.

Use mocks/fakes where appropriate.

Test at least:

1. Valid session can be created.
2. Invalid session is rejected.
3. Getting an existing session returns it.
4. Getting a missing session produces the correct not-found behaviour.
5. Updating a session changes editable fields.
6. Deleting a session calls the expected persistence operation.

Keep the existing health endpoint test passing.

If a small number of additional tests materially improve quality, add them.

# Frontend

Replace the Sessions placeholder page with a functional training session experience.

Required routes:

/sessions
/sessions/new
/sessions/:id
/sessions/:id/edit

Use React Router.

# Sessions page

Create a responsive Sessions page.

It should include:

- Page heading: "Training Sessions"
- Short supporting description
- "Add Session" button
- List/cards of existing sessions
- Loading state
- Empty state
- Error state

Each session card should show:

- Title
- Session type
- Date
- Prescription
- Status
- Intended intensity if provided

Make the cards visually clean and easy to scan.

Do not overload the UI.

# Empty state

If there are no sessions, show something useful such as:

"No sessions yet."

and:

"Add your first training session to start building clarity around your training."

Include a clear Add Session action.

# Create session page

Create a form containing:

Title
Session Type
Date
Prescription
Purpose
Focus Cue
Success Criteria
Intended Intensity
Coach Notes
Status

Use appropriate HTML controls.

Session Type should be a select.

Status should be a select.

Intended Intensity should use an appropriate numeric input.

Use labels for every field.

Show which fields are required.

Provide basic client-side validation for usability, while retaining backend validation as the source of truth.

Buttons:

Create Session
Cancel

After successful creation:

Navigate to the created session detail page.

# Session detail page

Display the session information in a structure designed around training clarity.

Suggested sections:

SESSION
- Title
- Type
- Date
- Status
- Intensity

PRESCRIPTION
- What the athlete has been asked to do

WHY YOU'RE DOING IT
- Purpose

FOCUS
- Focus cue

WHAT SUCCESS LOOKS LIKE
- Success criteria

COACH NOTES
- Coach notes

Do not generate missing explanations automatically.

If optional information has not been provided, show a subtle appropriate empty state rather than inventing content.

Include:

Edit Session
Delete Session
Back to Sessions

# Edit page

Reuse form logic/components where sensible.

The form should load the existing session.

The athlete should be able to change editable fields.

After successful update:

Return to the session detail page.

# Delete behaviour

Do not instantly delete when the user presses Delete.

Require a simple confirmation interaction.

After deletion:

Navigate back to /sessions.

Do not add a third-party modal library solely for this milestone unless already installed.

# API client

Keep frontend API functionality isolated in the API layer.

Create appropriate functions such as:

getTrainingSessions()
getTrainingSession(id)
createTrainingSession(input)
updateTrainingSession(id, input)
deleteTrainingSession(id)

Do not call fetch directly throughout page components.

Add TypeScript interfaces/types matching the API contract.

Avoid using `any`.

# Design

Continue the TrackRanker visual identity established in milestone 1.

The UI should feel:

- Athletic
- Focused
- Modern
- Calm
- Confidence-oriented

It should not feel like:

- A generic admin dashboard
- A bodybuilding app
- A social media platform
- A video game

Maintain responsive behaviour.

Design for both desktop and mobile.

Use the existing styling approach.

Do not introduce a large UI framework in this milestone.

# Accessibility

Ensure:

- Form inputs have labels
- Buttons have clear names
- Keyboard focus remains visible
- Navigation works using keyboard
- Form validation is understandable
- Semantic headings are used appropriately

# Frontend tests

Add focused tests.

Mock API requests rather than requiring a live backend.

Test at least:

1. Sessions page renders sessions returned by the API.
2. Empty state renders when no sessions exist.
3. Create session form renders required fields.
4. Valid form submission calls the create API.
5. Session detail page displays purpose and focus information.
6. Delete requires confirmation before calling the delete API.

Keep all existing milestone 1 frontend tests passing.

# Do not implement yet

Explicitly do NOT implement:

- Authentication
- Registration/login
- Multiple athletes
- Confidence before/after scores
- Post-session reflection
- Rep times
- Session performance calculations
- Personal best tracking
- XP
- Athlete levels
- Achievements
- Badges
- Streaks
- Dashboard analytics
- Zustand unless already genuinely required
- Theme switching
- Rate limiting
- AI-generated training explanations
- Coach accounts
- Notifications

Those belong to future milestones.

# Specs

Update documentation as part of this task.

Create:

specs/02-training-sessions.md

Document:

- Purpose of the training session feature
- TrainingSession fields
- SessionType values
- Status values
- Validation rules
- API endpoints
- Main frontend user flow
- Explicitly deferred functionality

Update the technical architecture spec if this milestone changes the documented architecture.

Create:

specs/prompts/002-training-session-crud.md

Copy this entire milestone prompt into that file.

Do not delete or rewrite:

specs/prompts/001-initial-scaffold.md

Existing prompt evidence must remain intact.

# README

Update the README only where the current implemented state has changed.

It should now accurately mention training session CRUD as implemented once verification succeeds.

Do not claim that confidence tracking, gamification, advanced requirements, or other future features have been implemented.

# Security advisory note

The previous milestone reported React Router 7.18.2 advisories where npm recommended react-router-dom@8.3.0, but that version was unavailable and returned ETARGET.

Do not force-install a nonexistent version.

Do not suppress the advisory.

Check whether a compatible published security fix is now available.

If no compatible fix is available, leave the current dependency unchanged and report the advisory accurately in the final summary.

Do not let this unrelated dependency issue expand the scope of this milestone.

# Git workflow

Before making changes:

1. Confirm the current working tree is clean.
2. Confirm the current HEAD includes:
   3c73d9b72a7f0c70048cce92fe704e4acde0819b
3. Inspect the existing architecture before modifying it.

After implementation run:

Backend:
- restore if required
- build
- all backend tests

Frontend:
- install dependencies only if required
- all frontend tests
- production build

Also run:

- git diff --check
- appropriate secret scan
- git status

Do not mark failing tests as successful.

Fix regressions caused by this milestone before committing.

# Manual verification

Where possible, verify the application end-to-end locally:

1. MongoDB starts successfully.
2. Backend starts successfully.
3. Scalar still loads.
4. Frontend starts successfully.
5. A session can be created.
6. Created session appears in the session list.
7. Session detail loads.
8. Session can be edited.
9. Session can be deleted.
10. Data remains after restarting the API because MongoDB provides persistence.

If environmental restrictions prevent manual verification, clearly report what could and could not be tested.

Do not fabricate manual verification.

# Commit

Only commit after required builds and automated tests pass.

Create one commit for this milestone.

Use exactly:

feat(sessions): implement training session CRUD

Do not create additional commits.

# Final report

When finished, provide:

1. Summary of the feature implemented.
2. Files created and modified.
3. Backend architecture introduced.
4. API endpoints created.
5. MongoDB collection created.
6. Frontend routes created.
7. Tests added.
8. Exact commands executed.
9. Build and test results.
10. Manual verification results.
11. Any security advisories or warnings.
12. Any unresolved issues.
13. Git commit hash and exact commit message.
14. Recommended scope for Milestone 3.

Do not claim the milestone is complete if required tests or builds fail.
