# Session progress feedback

## Problem

Process XP was already derived correctly, but an athlete had to visit the Dashboard or Progress page to see the effect of saving a completion. TrackRanker now gives restrained, immediate feedback after a successful completion create or edit.

## Comparison workflow

The completion workflow starts a `GET /api/progress` request before the save. After the completion `POST` or `PUT` succeeds, it requests progress again and compares the two backend-derived responses. The frontend calculates only the difference between `totalXp` values, the TrackRank change, and achievements that changed from locked to unlocked. It does not reproduce XP or achievement rules.

Both progress requests run without delaying the primary save. Afterward, their results are resolved together so the post-save request is not unnecessarily serialized behind the initial request.

## Feedback states

- A positive delta displays `Progress earned` and the signed XP increase.
- An unchanged total displays `Session updated` and explains that progress is unchanged, without emphasizing `+0 XP`.
- A negative delta displays `Progress updated` and the signed decrease in neutral language.
- If the initial progress request fails, saving continues. Current rank progress is shown when available, but no XP delta is invented.
- If the post-save request fails, the successful save is still reported and progress is described as temporarily unavailable.

When TrackRank increases, `TrackRank increased` is shown with the new rank. Only achievements that changed from locked to unlocked between the two responses are included; already-unlocked achievements are omitted.

## Temporary feedback

The existing navigation back to the session detail page remains unchanged. A presentation-focused feedback value is passed using React Router navigation state, retained for the rendered destination, and immediately removed from browser history with a replace navigation. Nothing is stored in MongoDB or permanent client state.

The feedback receives focus after navigation, uses text for all changes, includes an accessible progress element, and links to the full Progress page.

## Deferred

Stored XP, new rules or achievements, notifications, animation, sound, confetti, streaks, leaderboards, and global state libraries remain out of scope.
