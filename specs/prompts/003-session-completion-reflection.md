You are implementing Milestone 3 of TrackRanker.

IMPORTANT:
- Do NOT run git add.
- Do NOT create a git commit.
- Do NOT push anything.
- I will handle staging and committing manually from now on.
- You may use git status and git diff to review changes.
- Implement only this milestone.
- Do not make unrelated architectural changes.

Before making changes:

1. Read AGENTS.md.
2. Read README.md.
3. Read specs/00-product-brief.md.
4. Read specs/01-technical-architecture.md.
5. Read specs/02-training-sessions.md.
6. Review the existing training session backend and frontend implementation.
7. Review the existing tests.
8. Preserve all previous files in specs/prompts unchanged.

# Project context

TrackRanker is a training-clarity and confidence application for competitive
100m, 200m and 400m sprinters.

Current completed functionality:

- React + TypeScript frontend.
- C# .NET 10 backend.
- MongoDB persistence.
- Training session CRUD.
- Athletes can create, list, view, edit and delete planned sessions.
- Sessions contain:
  - title
  - session type
  - date
  - prescription
  - purpose
  - focus cue
  - success criteria
  - intended intensity
  - coach notes
  - status
- Scalar API documentation.
- Backend tests.
- Frontend tests.

Milestone 2 already established:

React frontend → .NET API → repository → MongoDB

Do not replace or substantially restructure this architecture.

# Milestone 3 goal

Implement completed-session results and post-session reflection.

The purpose is to clearly separate:

PLANNED TRAINING
from
COMPLETED TRAINING

An athlete should be able to open an existing training session and record:

- What they actually completed.
- Individual repetition results.
- How difficult the session felt.
- How intense the session felt.
- What went well.
- What improved.
- What felt difficult.
- What they want to focus on next time.
- Coach feedback.
- Confidence before the session.
- Confidence after the session.

This is the first milestone that stores confidence information.

However:

DO NOT implement confidence analytics.
DO NOT implement confidence charts.
DO NOT implement confidence trends.
DO NOT implement AI-generated encouragement.
DO NOT implement the Confidence page functionality yet.

Confidence is only being captured as part of the session reflection.

# Product principle

Reflection should support athlete confidence without providing generic motivational
claims or judging the athlete's coach.

The language should feel supportive and performance-focused.

Examples of useful reflection prompts:

- What went well?
- What improved today?
- What felt difficult?
- What do you want to focus on next time?
- What feedback did your coach give you?

Do not tell users their coach is right or wrong.

# Data architecture

Create a new MongoDB domain model named:

SessionCompletion

Use a separate MongoDB collection:

sessionCompletions

A completion belongs to exactly one TrainingSession.

Do not embed completed-session data directly into the existing TrainingSession model.

This separation is intentional:

TrainingSession = planned prescription
SessionCompletion = what actually happened

Create a unique MongoDB index on TrainingSessionId so that one training session
cannot accidentally have multiple completion records.

# SessionCompletion model

Use an internal MongoDB model similar to:

SessionCompletion
- Id
- TrainingSessionId
- CompletedAtUtc
- ActualIntensity
- PerceivedDifficulty
- RepetitionResults
- Reflection
- CreatedAtUtc
- UpdatedAtUtc

Use appropriate C# types and naming conventions.

Backend-generated values such as IDs and timestamps must not be trusted from the client.

# RepetitionResult model

A completion can contain zero or more repetition results.

Each repetition should contain:

- SetNumber
- RepetitionNumber
- DistanceMetres
- TimeSeconds
- Notes

Validation:

- SetNumber >= 1
- RepetitionNumber >= 1
- DistanceMetres > 0
- TimeSeconds > 0
- Notes optional with a sensible maximum length

Do not require repetition results.

Some sessions such as technical sessions, recovery sessions or gym sessions may not
have timed repetitions.

# Reflection model

Store:

- WentWell
- Improved
- WasDifficult
- NextFocus
- CoachFeedback
- ConfidenceBefore
- ConfidenceAfter

Text fields should be optional.

Use sensible maximum string lengths.

ConfidenceBefore and ConfidenceAfter:

- optional
- integer
- valid range 1 to 5

Use the following meaning in the frontend:

1 = Very low
2 = Low
3 = Neutral
4 = Good
5 = Very confident

Do not calculate a "confidence score" beyond storing these values.

# Session ratings

ActualIntensity:

- integer
- range 1–10
- required

PerceivedDifficulty:

- integer
- range 1–10
- required

Clearly label the difference in the frontend:

Actual intensity:
"How hard did you actually run/work?"

Perceived difficulty:
"How difficult did the session feel?"

Do not treat these values as medical data.

# Backend architecture

Follow the architecture established in Milestone 2.

Add:

- Internal MongoDB models.
- Request DTOs.
- Response DTOs.
- Repository interface.
- MongoDB repository implementation.
- Service interface.
- Service implementation.
- Controller.
- Validation.
- Mapping.

Keep controllers thin.

Do not expose MongoDB models directly through API responses.

Do not move repository queries outside the repository layer.

Register all new services and repositories through dependency injection.

Use async operations throughout.

# Relationship validation

Before creating a SessionCompletion:

- Validate the training session ID format.
- Confirm that the parent TrainingSession exists.

If the training session does not exist:

return HTTP 404.

If a completion already exists for that training session:

return HTTP 409 Conflict.

Do not silently overwrite an existing completion during POST.

# API design

Create nested REST endpoints:

GET
/api/training-sessions/{sessionId}/completion

POST
/api/training-sessions/{sessionId}/completion

PUT
/api/training-sessions/{sessionId}/completion

DELETE
/api/training-sessions/{sessionId}/completion

Expected behaviour:

GET
- 200 with completion if present.
- 404 if session does not exist.
- 404 if no completion has been recorded.

POST
- Creates the completion.
- 201 Created.
- 404 if parent training session does not exist.
- 409 if completion already exists.
- 400 for invalid input.

PUT
- Updates an existing completion.
- Preserve its original CreatedAtUtc.
- Update UpdatedAtUtc.
- 404 if session or completion does not exist.
- 400 for invalid input.

DELETE
- Deletes only the completion.
- Must NOT delete the TrainingSession.
- 204 No Content when successful.
- 404 when not found.

Malformed MongoDB IDs must never produce HTTP 500.

# Training session status

When a completion is successfully created:

Update the parent TrainingSession status to Completed.

Reuse existing repository/service behaviour where practical.

Do not duplicate MongoDB training-session query logic inside the completion repository.

If a completion is later edited, the session should remain Completed.

If a completion is deleted:

Do NOT automatically change the training session back to Planned.

There is not enough information to know what previous state is appropriate.

Document this design decision.

# MongoDB requirements

Use:

sessionCompletions

Create a unique index on TrainingSessionId.

Index creation should happen safely and idempotently.

Do not introduce MongoDB transactions for this milestone.

Document the trade-off that updating the completion and session status is not an
ACID transaction across collections.

Do not add a new database technology.

# DTO requirements

Create separate DTOs for:

- Creating a session completion.
- Updating a session completion.
- Returning a session completion.
- Repetition result input/output.
- Reflection input/output.

Do not accept:

- MongoDB IDs for new completions.
- CreatedAtUtc.
- UpdatedAtUtc.

from the client.

# Frontend routes

Add:

/sessions/:id/complete

Use this route for both creating and editing completed-session information.

Behaviour:

If no completion exists:
- display "Log completed session"

If completion exists:
- load existing data
- display "Edit completed session"

Do not create unnecessary separate create/edit routes unless the existing architecture
makes that clearly preferable.

# Session detail page

Extend the existing session detail page.

Keep the planned-session information clearly visible.

Add a visually distinct section:

Completed session

If no completion exists:

Show a concise empty state such as:

"You haven't logged the outcome of this session yet."

Provide a clear button:

"Log completed session"

If completion exists, show:

- Actual intensity
- Perceived difficulty
- Completion time/date
- Repetition results
- Reflection
- Confidence before
- Confidence after

Provide:

- Edit completed session
- Delete completed session

Deletion must require explicit confirmation.

Do not reuse the existing training-session delete confirmation in a confusing way.

It should be clear whether the athlete is deleting:

- the whole planned training session
or
- only its completed-session record.

# Completion form

Build a reusable component rather than placing all logic inside a route page.

Sections should be:

1. Session ratings
2. Repetition results
3. Reflection

## Session ratings

Fields:

Actual intensity: 1–10
Perceived difficulty: 1–10

Use accessible controls.

## Repetition results

Allow the athlete to dynamically:

- Add a repetition.
- Remove a repetition.

Each row contains:

- Set number
- Rep number
- Distance in metres
- Time in seconds
- Optional notes

Keep the UI usable on mobile.

Do not require the user to predefine how many repetitions exist.

## Reflection

Provide optional fields with these visible prompts:

What went well?

What improved today?

What felt difficult?

What do you want to focus on next time?

Coach feedback

Confidence before the session

Confidence after the session

Use the 1–5 confidence scale.

Do not use generic motivational quotes in this milestone.

# UX requirements

Maintain the existing TrackRanker visual identity.

Do not redesign the entire application.

Ensure:

- Responsive layout.
- Accessible labels.
- Keyboard-accessible controls.
- Visible focus states.
- Clear validation errors.
- Loading state.
- Submission state.
- API error state.
- Existing-data state.
- Empty state.
- Delete confirmation state.

Do not add unnecessary animation.

# Frontend API layer

Extend the existing typed API layer.

Do not call fetch directly from page components if the existing code centralises API calls.

Add TypeScript types for:

- SessionCompletion
- RepetitionResult
- SessionReflection
- CreateSessionCompletionRequest
- UpdateSessionCompletionRequest

Maintain consistency with backend DTOs.

# Backend tests

Add meaningful tests covering at minimum:

1. Creating a valid session completion.
2. Rejecting invalid rating values.
3. Rejecting invalid repetition values.
4. Returning 404 when the parent training session does not exist.
5. Returning conflict when a completion already exists.
6. Retrieving an existing completion.
7. Updating an existing completion.
8. Preserving CreatedAtUtc during update.
9. Deleting only the completion.
10. Updating the parent training session status to Completed after creation.

Use the project's existing test patterns.

Do not require a live MongoDB instance for normal unit tests.

# Frontend tests

Add meaningful tests covering at minimum:

1. Empty completion state on a session detail page.
2. Existing completion information renders correctly.
3. Completion form renders reflection prompts.
4. Required ratings are validated.
5. Confidence values outside the valid range cannot be submitted.
6. A repetition row can be added.
7. A repetition row can be removed.
8. A valid completion request is submitted with the expected payload.
9. Existing completion data populates edit mode.
10. Completion deletion requires confirmation.

Mock API calls.

Tests must not depend on a live backend or MongoDB database.

# Existing functionality

All Milestone 2 behaviour must continue working.

Do not break:

- Session list.
- Session create.
- Session details.
- Session edit.
- Session delete.
- Health endpoint.
- Scalar.
- Existing tests.

# Out of scope

Do NOT implement any of the following:

- Authentication.
- User accounts.
- Multiple athletes.
- Authorisation.
- Confidence analytics.
- Confidence charts.
- Confidence trends.
- Confidence dashboard functionality.
- Gamification.
- XP.
- Levels.
- Achievements.
- Streaks.
- Personal best tracking.
- Training recommendations.
- AI-generated feedback.
- AI-generated session explanations.
- Race-day mode.
- Coach accounts.
- Coach messaging.
- WebSockets.
- Zustand.
- Theme switching.
- Rate limiting.
- New security features.
- Deployment changes.
- Docker changes.
- Dependency upgrades unrelated to this milestone.
- React Router advisory work.

Do not address unrelated npm advisories in this milestone.

# Documentation

Create:

specs/03-session-completion-and-reflection.md

Document:

- Purpose of the milestone.
- Planned vs completed session separation.
- SessionCompletion schema.
- Repetition result structure.
- Reflection structure.
- Confidence scale.
- Validation rules.
- API endpoints.
- Frontend workflow.
- MongoDB collection.
- Unique TrainingSessionId index.
- Why SessionCompletion is a separate collection.
- Status update behaviour.
- Delete behaviour.
- Non-transactional cross-collection status update trade-off.
- Explicitly deferred features.

Update:

README.md

Only update sections that are now affected.

Do not claim deferred functionality exists.

Update:

specs/00-product-brief.md

only where necessary to reflect that post-session reflection is now implemented.

Update:

specs/01-technical-architecture.md

only where necessary to show the new SessionCompletion flow.

Do not rewrite these documents unnecessarily.

# AI prompt evidence

Create:

specs/prompts/003-session-completion-reflection.md

Copy this COMPLETE prompt into that file exactly as development evidence.

Do not modify:

specs/prompts/001-initial-scaffold.md

Do not modify:

specs/prompts/002-training-session-crud.md

except if their current state already differs from their original evidence, in which
case report the issue and do not overwrite them.

# Verification

After implementation, run the appropriate verification commands.

Backend:

dotnet build backend\TrackRanker.slnx

dotnet test backend\TrackRanker.slnx --no-build

Frontend:

npm test

npm run build

Also run:

git diff --check

Review git status.

Perform a basic secret scan over modified source/configuration files.

Check that generated files such as:

- node_modules
- bin
- obj
- dist
- coverage

have not accidentally become tracked/staged.

Do NOT git add anything.

Do NOT commit anything.

# Manual verification

If MongoDB is available locally:

Manually verify:

1. Create a training session.
2. Add a completed-session record.
3. Confirm GET returns it.
4. Confirm the parent session now reports Completed.
5. Edit the completion.
6. Refresh the frontend and verify persistence.
7. Delete the completion.
8. Confirm the parent training session still exists.
9. Restart the API.
10. Confirm persisted records remain.

If MongoDB is NOT available:

Do not install unrelated system software.

Do not fail the milestone solely because live MongoDB verification is unavailable.

Clearly report the verification gap.

# Quality requirements

- Keep files focused.
- Keep controllers thin.
- Keep MongoDB access inside repositories.
- Keep validation close to API boundaries and service rules.
- Avoid duplicated mapping logic.
- Avoid broad refactors.
- Do not suppress warnings to make builds pass.
- Do not weaken existing tests.
- Do not report a command as successful unless it actually ran successfully.
- Preserve existing architectural conventions where reasonable.

# Final response

When finished, report:

1. Feature summary.
2. Files created and modified.
3. Data model introduced.
4. MongoDB collection/index details.
5. API endpoints.
6. Frontend routes and workflow.
7. Validation rules.
8. Backend tests added.
9. Frontend tests added.
10. Commands run.
11. Exact build/test results.
12. Manual verification performed.
13. Any warnings or unresolved issues.
14. git status summary.
15. Recommended next milestone.

IMPORTANT:
Do NOT report a commit hash.
Do NOT create a commit.
Do NOT stage the changes.

I will review the changes and perform git add / git commit myself.
