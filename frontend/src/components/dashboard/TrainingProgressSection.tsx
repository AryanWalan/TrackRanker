import { Link } from "react-router-dom";
import type { Progress } from "../../types/progress";
import { DashboardSection } from "./DashboardSection";

interface TrainingProgressSectionProps {
  error: boolean;
  progress: Progress | null;
}

export function TrainingProgressSection({ error, progress }: TrainingProgressSectionProps) {
  return (
    <DashboardSection
      className="dashboard-progress"
      labelledBy="dashboard-progress-title"
      tone="progress"
    >
      <div className="dashboard-section-heading">
        <p className="eyebrow">Training process</p>
        <h2 id="dashboard-progress-title">Your training progress</h2>
        <p className="dashboard-section-support">
          TrackRank rewards completing sessions, reflecting, and checking in with your confidence.
        </p>
      </div>
      <div className="dashboard-rank" aria-labelledby="dashboard-rank-title">
        <div className="dashboard-rank-introduction">
          <p className="eyebrow">Current TrackRank</p>
          <h3 id="dashboard-rank-title">
            {progress ? `TrackRank ${progress.trackRank}` : "TrackRank"}
          </h3>
          <p className="dashboard-rank-context">
            TrackRank reflects engagement with your training process, not sprint ability.
          </p>
        </div>
        {!progress && !error && <p className="dashboard-rank-state" role="status">Calculating progress…</p>}
        {error && (
          <p className="dashboard-rank-state" role="status">
            Progress is unavailable right now.
          </p>
        )}
        {progress && (
          <div className="dashboard-rank-summary">
            <div className="dashboard-rank-values">
              <strong>{progress.totalXp} XP</strong>
              <span>{progress.currentRankXp} / {progress.xpPerRank} to next rank</span>
            </div>
            <progress
              aria-label={`TrackRank ${progress.trackRank} progress`}
              max={progress.xpPerRank}
              value={progress.currentRankXp}
            />
            <Link className="button secondary" to="/progress">View progress</Link>
          </div>
        )}
      </div>
    </DashboardSection>
  );
}
