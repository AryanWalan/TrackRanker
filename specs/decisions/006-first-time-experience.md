# ADR 006: Prioritise first-time comprehension

- Status: Accepted
- Date: 2026-07-31

## Context

TrackRanker had developed meaningful session, completion, reflection, confidence, and progress functionality, but first-time users could not immediately understand what the product was, why it was useful, or which action they should take first. A placeholder Profile destination and dense Confidence evidence also weakened navigation and scanning.

## Decision

Prioritise first-time comprehension and a clear training-workflow hierarchy before adding more features.

The Dashboard becomes the concise onboarding surface. It explains the target athlete, the product purpose, a three-step workflow, and the primary action before showing TrackRank, recent training, or system status.

## Rationale

- The Dashboard is already the default route, so orientation is available without a separate entry flow.
- Concise in-page guidance avoids an interruptive tutorial modal and remains useful to returning athletes.
- **Log a session** clearly creates new work, while **Training history** clearly reviews and manages existing work.
- Removing the unused Profile navigation avoids presenting a dead end as a working feature. Direct `/profile` visits redirect safely.
- Confidence is framed as evidence from previous training so its purpose and required athlete behaviour are explicit.
- Blank reflection fields are omitted because empty headings add noise and make stored data feel unfinished.
- Clear hierarchy, terminology, and next actions improve the existing product more than another feature would at this stage.

## Consequences and trade-offs

- The Dashboard contains slightly more guidance, but the content is short and structured for scanning.
- The Sessions navigation label remains concise while the page and Dashboard use the clearer **Training history** concept.
- Profile functionality is not discoverable because it is not implemented.
- Confidence cards use only current API fields and calculations, so this milestone improves presentation without adding metrics.

## Alternatives considered

- A tutorial modal was rejected because it interrupts use, requires dismissal state, and is easy to skip.
- A separate onboarding route was rejected because it would duplicate the Dashboard's orientation role.
- Keeping Profile visible as “coming soon” was rejected because primary navigation should contain useful destinations.
- Adding backend-generated Confidence interpretation was rejected because existing athlete evidence is sufficient and unsupported psychological claims remain outside TrackRanker's purpose.
