# ADR 004: Reward engagement with the training process

- Status: Accepted
- Date: 2026-07-30

## Context

Gamification could accidentally reward excessive training, higher intensity, faster results, or work outside a coach's plan. Those incentives would conflict with TrackRanker's athlete-safety and coach-support principles.

## Decision

TrackRanker rewards engagement with the training process: recorded completions, meaningful reflections, and paired confidence check-ins.

## Rationale

- A completion represents following through on planned training without judging intensity, volume, or outcome.
- Reflection rewards attention to what happened and what the athlete wants to remember.
- Paired confidence check-ins encourage honest before-and-after awareness without rewarding whether confidence rose.
- Sprint times, intensity, personal bests, and volume do not affect TrackRank because rank represents app engagement, not athletic ability.
- XP and achievements are derived from completion evidence so edits and deletions cannot leave stale balances or unlocked records.
- There is no leaderboard because TrackRank is personal process feedback, not athlete comparison.

## Trade-offs

- Derived calculations read all current completions, which is simple and correct for the present single-athlete scale but may need an optimised read model later.
- Athletes can progress only through recorded evidence, so incomplete logging produces an incomplete rank.
- Fixed transparent rules are less flexible than configurable gamification.
- Avoiding streaks and competition makes the system calmer but less socially engaging.

