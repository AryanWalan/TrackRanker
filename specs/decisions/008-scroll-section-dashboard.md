# ADR 008: Structure the Dashboard as scroll sections

- Status: Accepted
- Date: 2026-08-04

## Context

The Dashboard contained the correct information but presented it as one continuous stack of similarly weighted cards. First-time athletes could read the content, yet normal scrolling did not clearly distinguish understanding the product, learning the workflow, choosing an action, reviewing process progress, and returning to recent training.

## Decision

Structure the Dashboard as distinct scroll sections, each introducing one major idea. Use a shared section component for semantic labelling, visual tone, full-width backgrounds, and consistently constrained inner content. Keep the existing route, APIs, navigation, and normal document scrolling.

The order is Hero, How TrackRanker works, Start training, Your training progress, Recent training, then System status.

## Rationale

- Distinct section boundaries make the source hierarchy visible and improve first-time comprehension without adding more explanatory copy.
- Full-width background bands create clear chapter transitions, while a shared maximum-width inner container preserves readable lines and alignment.
- Normal scrolling is predictable, accessible, and responsive. Scroll snapping, parallax, and triggered animation would add control and motion costs without improving the core task.
- The Dashboard remains an application because each section supports an existing athlete workflow, API summary, or navigation action rather than adding promotional content.
- TrackRank appears after the workflow and actions so process rewards support training instead of becoming the first reason to use the application.
- System status moves to the bottom because connection health is useful operational context but not an athlete feature.

## Consequences and trade-offs

- The Dashboard uses more vertical space, but controlled padding and concise copy make each transition intentional rather than wasteful.
- A route-specific application-shell content class is required so Dashboard backgrounds can span the page while other routes keep their existing constrained layout.
- Presentational sections add several focused component files, while `DashboardPage` remains the clear owner of sessions and progress loading.
- Alternating tones must remain coordinated as the design evolves; the shared section primitive and existing colour variables provide that constraint.
- Hero and Start Training both expose a logging route. The Hero gives an immediate next step, while Start Training explains the choice between creating and reviewing sessions.

## Alternatives considered

- Keeping one centred card stack was rejected because it preserved the original hierarchy problem.
- Separate routes were rejected because the information forms one Dashboard journey.
- Full-screen panels were rejected because this is a functional application, not a presentation.
- Scroll snapping and animations were rejected because they interfere with predictable browser scrolling and add no functional value.
- Moving Dashboard server responses into Zustand was rejected because the API remains their source of truth and the existing independent local requests are appropriate.
