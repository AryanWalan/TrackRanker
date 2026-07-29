# ADR 002: Use progressive disclosure for session entry

- Status: Accepted
- Date: 2026-07-29

## Context

The original create-session form asked athletes for all prescription and clarity information at once. Athlete feedback said it felt like a long application form. That interaction cost discouraged quick logging at the track, even when the athlete already understood the session.

## Decision

Prioritise required workout information—type, date, prescription, and planned intensity—and keep purpose, focus cue, success criteria, and coach notes behind one accessible **Add more clarity** disclosure.

An optional custom title remains secondary. When omitted, the backend generates a predictable title from the session type and prescription.

## Rationale

- Fewer initially visible fields reduce scanning, typing, and decision cost.
- Athletes can record a known workout quickly without abandoning TrackRanker's clarity purpose.
- The same form still supports athletes who want to structure why the session matters.
- Existing clarity automatically opens during edit, protecting stored information.
- Static templates offer conservative starting points without introducing AI behavior, network dependency, or claims of personalised coaching.
- Suggestions never overwrite athlete wording or coach notes, leaving coach-specific interpretation under the athlete's control.

## Trade-offs

- Optional clarity may be recorded less often.
- Generated titles are predictable rather than linguistically polished.
- Static presets cover only selected existing session types and require deliberate maintenance.
- Status and custom title remain visible secondary controls to preserve established functionality, so the initial form is not limited to exactly four controls.

These trade-offs are preferable to a wizard, separate quick-create endpoint, or forced explanatory questionnaire.
