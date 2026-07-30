import { useEffect, useState } from "react";
import { getProgress } from "../services/trainingSessions";
import type { Progress } from "../types/progress";

export function ProgressPage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getProgress()
      .then((result) => {
        if (active) setProgress(result);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <section className="state-panel error-panel" role="alert">
        <h1>Your TrackRank</h1>
        <p>Progress could not be loaded right now. Your training records are unchanged.</p>
      </section>
    );
  }

  if (!progress) {
    return (
      <section className="state-panel" aria-live="polite">
        <h1>Your TrackRank</h1>
        <p>Calculating your training-process progress…</p>
      </section>
    );
  }

  return (
    <section className="progress-page">
      <header className="page-heading compact">
        <div>
          <p className="eyebrow">Process progress</p>
          <h1>Your TrackRank</h1>
          <p>Build your rank by completing sessions, reflecting, and checking in with your confidence.</p>
          <p className="rank-explanation">TrackRank reflects your training process, not how fast you run.</p>
        </div>
      </header>

      <section className="trackrank-card" aria-labelledby="current-trackrank">
        <div>
          <p className="eyebrow">Current rank</p>
          <h2 id="current-trackrank">TrackRank {progress.trackRank}</h2>
          <p className="total-xp">{progress.totalXp} XP</p>
        </div>
        <div className="rank-progress">
          <label htmlFor="trackrank-progress">
            {progress.currentRankXp} / {progress.xpPerRank} XP to next rank
          </label>
          <progress
            id="trackrank-progress"
            max={progress.xpPerRank}
            value={progress.currentRankXp}
          >
            {progress.currentRankXp} of {progress.xpPerRank} XP
          </progress>
        </div>
      </section>

      <section className="xp-rules" aria-labelledby="xp-rules-heading">
        <div>
          <p className="eyebrow">Transparent rules</p>
          <h2 id="xp-rules-heading">How XP is earned</h2>
        </div>
        <dl>
          <div><dt>Complete a session</dt><dd>+20 XP</dd></div>
          <div><dt>Add a reflection</dt><dd>+10 XP</dd></div>
          <div><dt>Confidence check-in</dt><dd>+5 XP</dd></div>
        </dl>
      </section>

      <section className="process-summary" aria-labelledby="process-summary-heading">
        <h2 id="process-summary-heading">Your process</h2>
        <dl>
          <div><dt>Completed sessions</dt><dd>{progress.completedSessions}</dd></div>
          <div><dt>Reflections</dt><dd>{progress.meaningfulReflections}</dd></div>
          <div><dt>Confidence check-ins</dt><dd>{progress.pairedConfidenceCheckIns}</dd></div>
        </dl>
      </section>

      <section className="achievements-section" aria-labelledby="achievements-heading">
        <div>
          <p className="eyebrow">Process milestones</p>
          <h2 id="achievements-heading">Achievements</h2>
        </div>
        <div className="achievement-grid">
          {progress.achievements.map((achievement) => (
            <article
              className={`achievement-card ${achievement.isUnlocked ? "unlocked" : "locked"}`}
              key={achievement.id}
            >
              <p className="achievement-status">
                {achievement.isUnlocked
                  ? "Unlocked"
                  : `${achievement.currentProgress} / ${achievement.requiredProgress} progress`}
              </p>
              <h3>{achievement.name}</h3>
              <p>{achievement.description}</p>
              {!achievement.isUnlocked && (
                <progress
                  aria-label={`${achievement.name}: ${achievement.currentProgress} of ${achievement.requiredProgress}`}
                  max={achievement.requiredProgress}
                  value={achievement.currentProgress}
                >
                  {achievement.currentProgress} of {achievement.requiredProgress}
                </progress>
              )}
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
