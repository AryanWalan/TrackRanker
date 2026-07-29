You are implementing Milestone 4 of TrackRanker.

IMPORTANT:
- Do NOT run git add.
- Do NOT create a git commit.
- Do NOT push anything.
- I will handle staging and committing manually.
- You may use git status and git diff for review.
- Implement only this milestone.
- Do not make unrelated architectural changes.

Before making changes:

1. Read AGENTS.md.
2. Read README.md.
3. Read specs/00-product-brief.md.
4. Read specs/01-technical-architecture.md.
5. Read specs/02-training-sessions.md.
6. Read specs/03-session-completion-and-reflection.md.
7. Review the existing TrainingSession model, DTOs, validation,
   controller, service and repository.
8. Review the current frontend TrainingSessionForm implementation.
9. Review all existing backend and frontend tests.
10. Preserve all previous prompt evidence unchanged.

# Project context

TrackRanker is a training-clarity and confidence application for
100m, 200m and 400m sprinters.

Current functionality includes:

- Training session CRUD.
- Planned-session information.
- Completed-session results.
- Repetition outcomes.
- Structured reflection.
- Confidence before and after sessions.
- MongoDB persistence.
- React + TypeScript frontend.
- C# .NET 10 backend.
- Scalar API documentation.
- Automated frontend and backend tests.

# User feedback driving this milestone

The current session creation experience feels:

"like a job application / long and boring"

This milestone should directly address that feedback.

The athlete should be able to quickly record the session their coach
has prescribed without being required to fill in every explanatory field.

The session form should feel like logging a workout, not completing
a questionnaire.

# Milestone goal

Redesign session creation and editing around progressive disclosure.

Separate fields into:

1. Session essentials
2. Optional session clarity

Creating a basic training session should take approximately 20–30 seconds
for an athlete who already knows their session.

Do not remove useful clarity functionality.

Instead, make it optional and easier to access when wanted.

# Core product principle

TrackRanker exists partly because sprinters can lack clarity about why
they are doing a session.

However, forcing athletes to manually explain every session creates
unnecessary friction.

The interface should therefore support two behaviours:

QUICK LOGGING

An athlete already understands the session and just wants to record it.

CLARITY SUPPORT

An athlete wants help structuring the purpose, focus and success criteria.

Both should be supported without requiring separate applications or flows.

# New create-session experience

Redesign the create session form so the initial visible fields are:

- Session type
- Date
- Prescription
- Intended intensity

Optionally include a short session title if the existing architecture
requires it, but investigate whether a title can be automatically derived.

Do not show every secondary field immediately.

Below the essential fields, provide a clearly labelled expandable area:

"Add more clarity"

Inside it place:

- Purpose
- Focus cue
- Success criteria
- Coach notes

The clarity section should be collapsed by default when creating a session.

When editing an existing session:

- If any clarity fields already contain values, the section should start expanded.
- Existing values must never be hidden or lost.
- If no clarity information exists, it may remain collapsed.

# Session title

Review whether requiring users to manually type a session title adds value.

Preferred behaviour:

Automatically create a useful display title from session type and prescription
when a custom title is not supplied.

Examples:

Acceleration — 4 × 30m

Speed Endurance — 3 × 150m

Max Velocity — 5 × 30m Fly

Do not attempt complex natural-language parsing.

Use a simple predictable rule.

If the existing data model requires Title:

- Allow the backend to generate a reasonable title when Title is blank.
- Preserve manually entered titles.
- Do not break existing sessions.

If this would cause excessive architectural change, keep the title field
but make it optional and visually secondary.

Document the final decision.

# Session type UX

The session type control should be quick to scan.

Use the existing supported session types.

Do not introduce arbitrary new types without checking the existing controlled
values.

Prefer a visually understandable selection control over a long plain text field.

It must remain:

- keyboard accessible
- mobile friendly
- screen-reader understandable

Do not use decorative controls that harm accessibility.

# Prescription UX

Prescription is one of the most important fields.

Give it visual priority.

Label it:

"What's the session?"

Use example placeholder content such as:

3 × 150m, 10 min rest

or

2 sets of 20m – 30m – 30m – 20m

Do not store the placeholder as actual data.

Add concise helper text if useful.

Do not add a complex workout-builder system in this milestone.

Prescription remains plain text.

# Intended intensity UX

Keep the existing backend-compatible value/range.

Make this easier to understand.

Use a concise visible label:

"Planned intensity"

If appropriate with the existing value range, display the percentage symbol
or explanatory helper text.

Do not silently change the underlying API meaning.

Do not introduce intensity analytics.

# Sprint clarity presets

Add a lightweight frontend-only preset system for supported session types.

These are suggestions, not coaching prescriptions.

A preset may contain suggested:

- Purpose
- Focus cue
- Success criteria

Examples should be conservative and general.

Possible categories:

Acceleration

Suggested purpose:
"Improve the first phase of the sprint and build speed efficiently."

Suggested focus:
"Push strongly, stay patient and build your body position gradually."

Suggested success criteria:
"Consistent accelerations with controlled technique."

Max Velocity

Suggested purpose:
"Develop upright sprinting speed and efficient mechanics."

Suggested focus:
"Run tall, relaxed and strike underneath the body."

Suggested success criteria:
"Fast, relaxed repetitions without excessive tension."

Speed Endurance

Suggested purpose:
"Maintain high sprint speed as fatigue begins to increase."

Suggested focus:
"Stay relaxed and maintain rhythm throughout the repetition."

Suggested success criteria:
"Complete the planned repetitions without a major breakdown in technique."

Tempo

Suggested purpose:
"Build general conditioning while keeping the running controlled."

Suggested focus:
"Stay relaxed and maintain consistent rhythm."

Suggested success criteria:
"Complete the planned volume at controlled effort."

Competition / Race

Suggested purpose:
"Execute the planned race strategy and technical cues."

Suggested focus:
"Commit to the race plan and stay composed."

Suggested success criteria:
"Judge the performance by execution as well as the final time."

Only include presets for session types already supported by TrackRanker.

Do not add unsupported session-type values purely for these examples.

# Preset behaviour

Do NOT automatically overwrite athlete-entered text.

Inside the expanded clarity section, provide an action such as:

"Use suggested clarity"

When selected:

- Populate only currently empty clarity fields.
- Never overwrite non-empty Purpose.
- Never overwrite non-empty FocusCue.
- Never overwrite non-empty SuccessCriteria.
- CoachNotes must never be populated automatically.

If the athlete changes session type after entering clarity information:

- Do not automatically replace their text.

Suggestions should be clearly presented as editable starting points.

Do not describe them as AI-generated.

They are static TrackRanker templates.

# Backend changes

Review current validation rules.

The following should remain required:

- SessionType
- SessionDate
- Prescription
- IntendedIntensity

The following should become optional if currently required:

- Title, subject to the title-generation decision
- Purpose
- FocusCue
- SuccessCriteria
- CoachNotes

Use sensible maximum lengths.

Do not remove server-side validation.

Do not trust frontend validation alone.

Existing MongoDB records must continue to deserialize correctly.

Do not perform destructive migration logic.

# API compatibility

Maintain the existing endpoints:

GET /api/training-sessions

GET /api/training-sessions/{id}

POST /api/training-sessions

PUT /api/training-sessions/{id}

DELETE /api/training-sessions/{id}

Do not create a separate quick-create endpoint.

The normal POST endpoint should support the streamlined payload.

Existing clients sending all fields should continue to work.

# Training session responses

Ensure response DTOs safely represent missing optional clarity values.

Frontend rendering should gracefully handle sessions with:

- no purpose
- no focus cue
- no success criteria
- no coach notes

Do not render empty headings or large blank sections.

On the session details page, if no clarity fields exist, provide a concise
option to edit the session and add clarity rather than displaying several
empty values.

# Frontend component design

Refactor the existing reusable TrainingSessionForm rather than creating
an unrelated second implementation.

Structure it clearly into:

ESSENTIALS

- Session type
- Date
- Prescription
- Planned intensity

OPTIONAL CLARITY

Expandable section:

"Add more clarity"

- Purpose
- Focus cue
- Success criteria
- Coach notes
- Use suggested clarity action

CUSTOM TITLE

If custom title remains available, place it somewhere secondary rather
than making it the first thing the athlete sees.

# Visual hierarchy

The form should feel noticeably shorter on first load.

Avoid:

- large vertical gaps
- every field appearing as equally important
- excessive explanatory paragraphs
- repeating obvious labels
- giant forms on desktop
- long uninterrupted single-column layouts where a compact layout is appropriate

Use the existing TrackRanker visual identity.

Do not redesign the entire application.

On desktop, appropriate short fields may sit side by side.

On mobile, fields should stack cleanly.

The prescription field should remain easy to use on both.

# Copy and tone

Use short athlete-focused copy.

Good:

"What's the session?"

"Planned intensity"

"Add more clarity"

"Use suggested clarity"

"Coach notes"

Avoid:

"Please enter the prescribed details of your training session"

"Additional session information"

"Supplementary training metadata"

The app should sound like something an athlete would actually use at the track.

# Create button

Use a concise primary action:

"Create session"

While submitting:

"Creating..."

For edit mode:

"Save changes"

While saving:

"Saving..."

Do not use vague labels such as "Submit".

# Successful creation

After successful creation:

Navigate to the created session detail page using the existing behaviour
or the most natural behaviour supported by the current architecture.

Do not introduce unnecessary success modals.

A subtle confirmation is acceptable if consistent with the existing UI.

# Accessibility

Ensure:

- Form fields have programmatic labels.
- Expand/collapse control exposes its state.
- Keyboard users can operate all controls.
- Focus states remain visible.
- Validation messages are connected to inputs where practical.
- Preset actions have clear accessible names.
- Colour is not the only indicator of state.

# Backend tests

Update/add meaningful tests covering at minimum:

1. Creating a session with only required essential fields succeeds.
2. Optional clarity fields can be omitted.
3. Creating a session with clarity fields still works.
4. Updating a session can add clarity later.
5. Updating a session can remove optional clarity values.
6. Required essential fields are still validated.
7. Existing fully populated session behaviour remains compatible.
8. Generated/default title behaviour, if implemented.

Do not reduce existing coverage.

# Frontend tests

Update/add meaningful tests covering at minimum:

1. Create form initially shows the essential fields.
2. Optional clarity fields are not visually expanded by default.
3. "Add more clarity" exposes the optional fields.
4. A session can be submitted without clarity fields.
5. Suggested clarity fills empty supported fields.
6. Suggested clarity does not overwrite existing athlete-entered text.
7. Changing session type does not silently overwrite clarity.
8. Existing session clarity causes edit mode to open the section.
9. Optional custom title behaviour works if retained.
10. Existing create/edit functionality continues working.

Mock API calls.

Do not depend on the live API for frontend tests.

# Existing session details UX

Review the session detail page for optional content.

A session without purpose/focus/success criteria should still look intentional.

Avoid output such as:

Purpose:
—

Focus:
—

Success criteria:
—

Instead either:

- omit missing optional rows
or
- show one concise clarity empty state.

Do not dramatically redesign the page.

# Out of scope

Do NOT implement:

- Confidence history page functionality.
- Confidence analytics.
- Confidence graphs.
- Gamification.
- XP.
- Levels.
- Achievements.
- Streaks.
- Authentication.
- User accounts.
- Multiple athletes.
- Authorisation.
- Zustand.
- Theme switching.
- Rate limiting.
- WebSockets.
- AI-generated session explanations.
- AI calls.
- Workout parsing.
- Drag-and-drop session builders.
- Calendar scheduling.
- Coach accounts.
- Training recommendations.
- Deployment changes.
- Docker changes.
- Dependency upgrades unrelated to this milestone.
- React Router advisory work.

# Documentation

Create:

specs/04-streamlined-session-creation.md

Document:

- User feedback that motivated the redesign.
- Original usability problem.
- Progressive disclosure approach.
- Essential fields.
- Optional clarity fields.
- Session-title decision.
- Sprint clarity preset behaviour.
- Validation changes.
- Accessibility considerations.
- Backwards compatibility.
- Explicitly deferred functionality.

Update:

README.md

Only update relevant implemented-feature and design sections.

Update:

specs/00-product-brief.md

Only where necessary to reflect the streamlined input philosophy.

Update:

specs/02-training-sessions.md

Document the updated create/edit experience and optional clarity behaviour.

Do not unnecessarily rewrite unrelated documentation.

# Design decision record

Create:

specs/decisions/002-progressive-session-form.md

Document:

Context:
The original create-session form asked athletes for too much information
at once and felt like a long application form.

Decision:
Use progressive disclosure to prioritise required workout information
and keep training-clarity fields optional.

Explain:

- Why this reduces interaction cost.
- Why clarity features are being retained.
- Why static suggestions are preferable to AI generation at this stage.
- Why athletes remain in control of coach-specific interpretation.
- Trade-offs.

# AI prompt evidence

Create:

specs/prompts/004-streamlined-session-creation.md

Copy this COMPLETE prompt into that file exactly.

Do not modify:

specs/prompts/001-initial-scaffold.md
specs/prompts/002-training-session-crud.md
specs/prompts/003-session-completion-reflection.md

Verify they remain unchanged.

# Verification

After implementation run:

Backend:

dotnet build backend\TrackRanker.slnx

dotnet test backend\TrackRanker.slnx --no-build

Frontend:

npm test

npm run build

Also run:

git diff --check

Review:

git status

Perform a basic secret scan over modified source/configuration files.

Check that generated files such as:

node_modules
bin
obj
dist
coverage

have not accidentally become tracked.

Do NOT run git add.

Do NOT commit.

# Manual verification

If the application environment is available, manually verify:

1. Open new session.
2. Confirm the initial form feels substantially shorter.
3. Create a session using only essential information.
4. Confirm it appears correctly in the session list.
5. Confirm its detail page handles missing clarity information cleanly.
6. Edit it.
7. Expand "Add more clarity".
8. Use suggested clarity.
9. Edit the suggested wording manually.
10. Save and verify persistence.
11. Create another session with custom clarity from the start.
12. Confirm existing fully populated sessions still render correctly.
13. Verify the form on a narrow/mobile viewport.
14. Verify keyboard interaction with the clarity disclosure control.

If MongoDB is unavailable, clearly report the manual persistence gap.

# Quality expectations

- Prefer simplification over adding more controls.
- Do not create a wizard or multi-page form.
- Do not require extra clicks for essential information.
- Keep components focused.
- Preserve architectural conventions.
- Avoid broad refactors.
- Do not weaken validation simply to make tests pass.
- Do not suppress warnings.
- Do not report tests as successful unless they actually passed.
- Do not silently alter existing data semantics.

# Final response

When finished, report:

1. UX problem addressed.
2. Summary of the new create/edit experience.
3. Files created and modified.
4. Backend validation/model changes.
5. Session title decision.
6. Sprint clarity preset implementation.
7. Accessibility changes.
8. Backend tests added/updated.
9. Frontend tests added/updated.
10. Commands run.
11. Exact build/test results.
12. Manual verification performed.
13. Any warnings or unresolved issues.
14. git status summary.
15. Recommended next milestone.

IMPORTANT:

Do NOT create a commit.
Do NOT stage any changes.
Do NOT push anything.
Do NOT report a commit hash.

I will review and commit the changes manually.
