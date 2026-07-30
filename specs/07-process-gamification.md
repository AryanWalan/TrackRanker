# Process-based gamification

## Purpose and philosophy

TrackRank makes healthy engagement with the athlete's own training process visible. It rewards completing prescribed sessions, reflecting, and recording paired confidence check-ins. It does not measure sprint ability or compare athletes.

TrackRank never rewards faster times, higher intensity, more volume, extra sessions, or training through pain. Those incentives could conflict with a coach's plan and athlete wellbeing.

## XP rules

XP is derived from each stored `SessionCompletion`:

- Completed session: 20 XP
- Meaningful reflection: 10 XP
- Paired confidence-before and confidence-after check-in: 5 XP

A meaningful reflection contains non-whitespace text in at least one of `WentWell`, `Improved`, `WasDifficult`, `NextFocus`, or `CoachFeedback`. Both confidence values are required for confidence XP. A fully logged completion earns 35 XP.

## TrackRank calculation

Each 100 XP increases TrackRank by one:

`TrackRank = floor(TotalXp / 100) + 1`

Current-rank XP is `TotalXp % 100`. There is no arbitrary maximum and no performance-related rank name.

## Achievements

| Achievement | Requirement |
| --- | --- |
| First Finish | 1 completed session |
| Reflective Start | 1 meaningful reflection |
| Building Routine | 5 completed sessions |
| Looking Back | 5 meaningful reflections |
| Check In | 3 paired confidence check-ins |
| Ten Sessions | 10 completed sessions |

All achievements are returned, including locked ones. Display progress is clamped to its threshold.

## Derived data and API

`GET /api/progress` returns HTTP 200 with XP, TrackRank, current-rank XP, process totals, and achievement progress. `ProgressController` calls `ProgressService`, which reads the existing completion repository. No XP balance, rank field, achievement collection, or other mutable gamification state is stored. Editing or deleting completion evidence therefore updates progress automatically.

## Frontend experience

`/progress` shows the current TrackRank, total XP, an accessible next-rank progress indicator, transparent XP rules, three process totals, and all six achievements. The Dashboard uses the same endpoint for a small rank summary and link while preserving quick actions and recent training.

Loading and failure states are non-technical. Dashboard progress failure does not block athlete-facing session features.

## Accessibility

- Native `progress` elements have visible labels.
- Every achievement states `Unlocked` or its numeric progress.
- Rank and achievement meaning does not rely on color or decorative icons.
- Semantic headings, visible focus styles, wrapping cards, and mobile stacking support keyboard, screen-reader, and narrow-screen use.

## Deferred gamification

Leaderboards, athlete comparison, streaks, social sharing, rewards for performance or volume, notifications, authentication, and multiple athlete profiles remain deferred.

