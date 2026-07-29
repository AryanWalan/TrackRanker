You are setting up the first milestone of a full-stack application called TrackRanker.

Read this entire prompt before making changes.

# Project overview

TrackRanker is a gamified training-clarity and confidence application for competitive 100m, 200m and 400m sprinters.

The application will eventually help sprinters:

- Understand the purpose of their prescribed training sessions.
- Record planned and completed sprint sessions.
- Record repetition times, intensity and session difficulty.
- Add post-session notes and reflections.
- Track confidence before and after training.
- See evidence of consistency and improvement.
- Earn XP, levels, achievements and healthy process-based streaks.

TrackRanker must support the coach-athlete relationship. It must not tell athletes that their coach is wrong, provide medical diagnoses or encourage training through injury.

# Required technology

Frontend:
- React
- TypeScript
- Vite
- React Router

Backend:
- C#
- .NET 10 Web API
- Controllers
- Scalar API documentation

Database:
- MongoDB
- Official MongoDB C#/.NET driver
- Database name: trackranker

Testing:
- Backend: xUnit
- Frontend: Vitest and React Testing Library

Repository:
- One Git repository containing the frontend, backend, tests, documentation and specs.

# Task scope

This is milestone 1 only.

Create a clean, runnable, tested full-stack project scaffold.

Do not implement training session CRUD, athlete profiles, authentication, confidence tracking, achievements, XP, levels or other main application features yet.

Do not add packages that are not required for this milestone.

# Required repository structure

Create the following general structure:

TrackRanker/
├── backend/
│   ├── TrackRanker.Api/
│   └── TrackRanker.Api.Tests/
├── frontend/
├── specs/
│   ├── prompts/
│   └── decisions/
├── AGENTS.md
├── README.md
├── .gitignore
└── docker-compose.yml

Small structural adjustments are allowed when required by the frameworks, but keep the repository organised and easy to understand.

# Backend requirements

Create a .NET 10 solution containing:

1. TrackRanker.Api
2. TrackRanker.Api.Tests

Configure the API with:

- Controller support.
- OpenAPI generation.
- Scalar API documentation.
- Development CORS configuration.
- Dependency injection.
- MongoDB configuration using strongly typed options.
- Environment-based configuration.
- Nullable reference types enabled.
- Appropriate async patterns.

Add configuration values for:

- MongoDb__ConnectionString
- MongoDb__DatabaseName
- Frontend__AllowedOrigin

Use safe local development defaults where appropriate:

- MongoDB connection: mongodb://localhost:27017
- MongoDB database: trackranker
- Frontend origin: http://localhost:5173

Do not include real credentials or secrets.

Create:

GET /api/health

It should return HTTP 200 with a simple response containing:

- status
- application
- UTC timestamp

Example shape:

{
  "status": "Healthy",
  "application": "TrackRanker.Api",
  "timestampUtc": "..."
}

Add at least one automated backend test that verifies the health endpoint returns HTTP 200 and the expected application name.

Keep Program.cs understandable. Do not place future application logic in Program.cs.

# Scalar requirements

Configure Scalar as the API documentation interface.

The Scalar page must be available when the backend runs in development.

Document its local URL in the README.

Do not use Swagger UI as the visible documentation interface.

# MongoDB requirements

Use the official MongoDB C# driver.

Create a strongly typed MongoDB settings class.

Register IMongoClient and IMongoDatabase through dependency injection.

The application should be ready for future MongoDB repositories, but do not create application collections or domain models yet.

The API should fail with a clear configuration error when required production configuration is absent.

Do not commit any real MongoDB Atlas connection string.

# Frontend requirements

Create a React and TypeScript application using Vite.

Configure React Router with a responsive application shell.

Add placeholder routes for:

- /
- /sessions
- /confidence
- /profile

Use these page names:

- Dashboard
- Sessions
- Confidence
- Profile

Each page only needs a heading and a short placeholder description in this milestone.

Add a navigation component that works on desktop and mobile.

Create a simple TrackRanker visual identity using clean athletics-inspired styling.

Use CSS or CSS modules for this milestone. Do not install a large component library yet.

The initial design should:

- Be responsive.
- Have readable typography.
- Have visible keyboard focus states.
- Use semantic HTML.
- Avoid generic Vite starter styling.
- Avoid excessive animation.
- Avoid emojis as primary interface icons.

Create an API configuration module that reads:

VITE_API_BASE_URL

Provide a safe local default pointing to the local backend.

Create a small API health service that can call GET /api/health.

The dashboard should display:

- “TrackRanker”
- A short tagline: “Understand your training. Trust your progress.”
- A backend connection status.

Handle loading, connected and error states clearly.

# Frontend testing requirements

Configure:

- Vitest
- React Testing Library
- jsdom

Add tests that verify:

1. The TrackRanker application name is rendered.
2. The primary navigation links are rendered.
3. At least one route can be navigated to correctly.
4. The health status component handles a successful mocked response.

Tests must not depend on a live backend.

# Docker requirements

Create a docker-compose.yml containing a local MongoDB service.

Requirements:

- Use a named volume for MongoDB data.
- Expose the standard MongoDB port for local development.
- Do not store credentials in the file.
- Include clear service and volume names.

This milestone does not need to containerise the frontend or backend.

Document how to start MongoDB using Docker Compose.

# Documentation requirements

Create AGENTS.md with instructions for future Codex tasks.

It must include:

- Project purpose.
- Required technology stack.
- Repository structure.
- Commands for running and testing the frontend.
- Commands for running and testing the backend.
- Coding conventions.
- Testing expectations.
- Security expectations.
- A rule to implement only the requested milestone.
- A rule not to make unrelated architectural changes.
- A rule to update /specs when decisions change.
- A rule not to delete previous AI prompt evidence.
- A rule to never commit secrets.
- A rule to use DTOs instead of directly exposing database models in future APIs.
- A rule to keep controllers thin and place business logic in services.
- A rule to report all tests and build commands run.

Create README.md containing:

- Project title and tagline.
- Brief project description.
- Target users.
- Current milestone status.
- Technology stack.
- Repository structure.
- Local prerequisites.
- MongoDB setup.
- Backend setup.
- Frontend setup.
- Test commands.
- Scalar documentation location.
- Environment variable documentation.
- Initial deployment plan.
- Statement that the repository is being developed through incremental commits.
- A placeholder section for the three assessed advanced requirements.
- A placeholder section for AI usage.
- A placeholder section for self-reflection.

Do not claim that unfinished functionality is implemented.

# Specs requirements

Create:

specs/00-product-brief.md

Include:

- Product name.
- Target users.
- Problem statement.
- Proposed solution.
- Product principles.
- Initial feature boundaries.
- Explicitly excluded features for the first version.

Create:

specs/01-technical-architecture.md

Include:

- Frontend architecture.
- Backend architecture.
- MongoDB approach.
- Environment configuration.
- Testing approach.
- Planned deployment architecture.
- A Mermaid diagram showing the frontend, API and MongoDB relationship.

Create:

specs/decisions/001-use-mongodb.md

Document:

- Decision to use MongoDB.
- Why it suits flexible sprint session and reflection data.
- Expected benefits.
- Risks and trade-offs.
- How schema consistency will still be enforced through backend models, DTOs and validation.

Create:

specs/prompts/001-initial-scaffold.md

Copy this full development prompt into that file as evidence of AI-assisted development.

# Environment example files

Create appropriate example environment files.

Frontend example:

VITE_API_BASE_URL=http://localhost:5000

Backend example values:

MongoDb__ConnectionString=mongodb://localhost:27017
MongoDb__DatabaseName=trackranker
Frontend__AllowedOrigin=http://localhost:5173

Do not commit actual local environment files containing secrets.

# Git requirements

Check whether the directory is already a Git repository.

If it is not, initialise Git.

Create an appropriate .gitignore covering:

- .NET build output
- Node modules
- frontend build output
- IDE files
- local environment files
- test coverage output
- operating-system files
- user secrets

Before committing:

1. Restore backend dependencies.
2. Build the backend.
3. Run all backend tests.
4. Install frontend dependencies.
5. Run all frontend tests.
6. Build the frontend.
7. Check that no secrets or generated dependency folders are staged.
8. Review git status.

Only create the commit if every required build and test passes.

Use exactly this commit message:

chore: initialise TrackRanker full-stack scaffold

Do not create multiple commits for this milestone.

# Quality expectations

- Use clear and consistent naming.
- Avoid duplicated configuration.
- Avoid placeholder code that causes warnings.
- Keep files focused on one responsibility.
- Do not suppress test failures.
- Do not report commands as successful unless they actually ran successfully.
- Do not silently change the required technology.
- Do not implement features outside this milestone.
- Do not create fake production deployment URLs.
- Do not expose stack traces or secrets through the API.
- Ensure the application can be extended incrementally.

# Final response

When finished, report:

1. Summary of what was created.
2. Final repository tree.
3. Important technical decisions.
4. Environment variables introduced.
5. Commands that were run.
6. Exact build and test results.
7. Commit hash and commit message.
8. Any warnings, failures or unresolved issues.
9. Recommended scope for milestone 2.

Do not say the task is complete if a required test or build failed.
