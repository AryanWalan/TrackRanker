# Dashboard landing experience and visual section system

## Visual problem addressed

The Dashboard contained the right athlete-facing information, but similarly weighted bordered panels inside one narrow column made the page feel like a continuous collection of cards. The information hierarchy was present in the source order without being equally clear during normal scrolling.

## Intended scroll journey

The Dashboard now introduces one idea at a time in this order:

1. Understand TrackRanker's purpose in the Hero.
2. Learn the three-step training workflow.
3. Choose whether to log or review training.
4. See process-based TrackRank progress.
5. Return to recent sessions.
6. Read secondary system status.

This remains one application route with normal browser scrolling. It is not a tutorial flow or a marketing microsite.

## Shared section system

`DashboardSection` provides every Dashboard chapter with a semantic `section`, an accessible heading relationship, a full-width visual tone, and one consistently constrained inner content container. Brand, neutral, surface, progress, and quiet tones use the existing navy, white, orange-red, and lime identity. Section backgrounds span the available page width while their content aligns to the same readable maximum width.

The sections use controlled vertical padding and subtle boundaries instead of presenting every area as a floating card. The Dashboard route removes the application shell's normal page inset so its section bands can meet the navigation and footer cleanly; other routes retain the existing constrained layout.

## Hero

The dark Hero immediately identifies TrackRanker as a training-clarity and confidence tool for 100m, 200m, and 400m sprinters. Its track-inspired ring remains decorative and is positioned away from body text. A primary **Log a session** action and secondary **View training history** link provide useful next steps without adding progress metrics to the introduction.

## How TrackRanker works

The workflow remains an ordered three-step journey: log the coach-prescribed session, complete and reflect, then build confidence from evidence. Numbered markers and a quiet connector create a left-to-right path on desktop. At narrow widths the same ordered list stacks vertically and the connector changes direction.

## Start Training action hierarchy

The action chapter is introduced by **Take action** and keeps **Log a session** visually and semantically primary. **Training history** remains secondary with distinct wording and supporting text. Both are large keyboard- and touch-friendly links, appear side by side when space permits, and stack on mobile.

## TrackRank placement

TrackRank follows orientation and action selection so gamification supports the training process without dominating it. The section preserves the current rank, total XP, current-rank progress, and Progress route. A native labelled progress element communicates the same current-rank value to assistive technology. The explanation explicitly states that TrackRank reflects training-process engagement, not sprint ability.

## Recent Training placement

Recent Training follows progress as a compact history snapshot. It still loads through the existing sessions API, sorts newest-first in the client, and shows no more than three title/type/date/prescription/status summaries. Loading, exact first-session guidance, independent failure copy, session links, and the all-sessions route remain available.

## System-status treatment

Health information is the final, visually quiet Dashboard section. It presents only **System connected**, **Connection unavailable**, or the temporary connection check and does not expose API, HTTP, or database details. The existing health request and live status semantics are unchanged.

## Responsive design

Section content uses fluid gutters and one maximum width across mobile, tablet, desktop, and wide desktop. Around 390px, Hero artwork is reduced and moved away from text, the workflow and actions stack, the TrackRank summary becomes one column, session cards become one column, and status content wraps without page-level horizontal overflow. Vertical section spacing reduces while retaining a clear chapter transition.

## Accessibility

- The Dashboard has one `h1`; major chapters use logical `h2` headings.
- Each section is labelled by its visible heading.
- The workflow is an ordered list and does not rely on connector styling for meaning.
- Link names describe their destinations, and primary/secondary actions remain distinct in text as well as colour.
- TrackRank progress uses a labelled native `progress` element.
- Health, loading, and error states use readable text and live-status or alert semantics.
- Existing visible focus styles remain in place, and no motion was added.

## Independent loading and errors

Dashboard API data remains local to `DashboardPage`. Sessions and progress load in separate effects, and HealthStatus owns its existing health request. Static orientation and actions render immediately. A sessions failure does not hide progress, a progress failure does not hide recent training, and a health failure changes only the final status.

## Explicitly deferred

Backend changes, new APIs, authentication, coach or athlete accounts, new TrackRank rules, achievements, analytics, personal bests, notifications, theme switching, WebSockets, charting libraries, scroll snapping, animation, deployment work, and dependency upgrades remain outside this milestone.
