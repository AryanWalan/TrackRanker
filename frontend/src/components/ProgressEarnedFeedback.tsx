import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { CompletionProgressFeedback } from "../types/completionProgressFeedback";

export function ProgressEarnedFeedback({
  feedback,
}: {
  feedback: CompletionProgressFeedback;
}) {
  const feedbackRef = useRef<HTMLElement>(null);

  useEffect(() => {
    feedbackRef.current?.focus();
  }, []);

  const { currentProgress, newlyUnlockedAchievements, rankIncreased, xpChange } = feedback;
  const heading = currentProgress === null
    ? "Session saved"
    : rankIncreased
      ? "TrackRank increased"
      : xpChange === null
        ? "Session saved"
        : xpChange > 0
          ? "Progress earned"
          : xpChange < 0
            ? "Progress updated"
            : "Session updated";

  return (
    <section
      className="progress-earned-feedback"
      aria-labelledby="progress-feedback-heading"
      aria-live="polite"
      ref={feedbackRef}
      tabIndex={-1}
    >
      <div className="progress-feedback-summary">
        <div>
          <p className="eyebrow">Saved successfully</p>
          <h2 id="progress-feedback-heading">{heading}</h2>
        </div>
        {xpChange !== null && xpChange !== 0 && (
          <p className="xp-change">{xpChange > 0 ? `+${xpChange}` : xpChange} XP</p>
        )}
      </div>

      {currentProgress === null ? (
        <p>Progress information is temporarily unavailable.</p>
      ) : (
        <>
          {xpChange === 0 && <p>Your progress total is unchanged.</p>}
          {xpChange === null && (
            <p>Your session was saved. A previous total was unavailable, so no XP change is shown.</p>
          )}
          <p className="feedback-rank">
            <strong>TrackRank {currentProgress.trackRank}</strong>
            <span>{currentProgress.currentRankXp} / {currentProgress.xpPerRank} XP</span>
          </p>
          <progress
            aria-label={`${currentProgress.currentRankXp} of ${currentProgress.xpPerRank} XP in TrackRank ${currentProgress.trackRank}`}
            max={currentProgress.xpPerRank}
            value={currentProgress.currentRankXp}
          >
            {currentProgress.currentRankXp} of {currentProgress.xpPerRank} XP
          </progress>
        </>
      )}

      {newlyUnlockedAchievements.length > 0 && (
        <div className="feedback-achievements">
          <h3>
            {newlyUnlockedAchievements.length === 1
              ? "Achievement unlocked"
              : "Achievements unlocked"}
          </h3>
          {newlyUnlockedAchievements.map((achievement) => (
            <article key={achievement.id}>
              <strong>{achievement.name}</strong>
              <p>{achievement.description}</p>
            </article>
          ))}
        </div>
      )}

      <Link className="button secondary" to="/progress">View progress</Link>
    </section>
  );
}
