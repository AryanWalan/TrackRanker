import { Link } from "react-router-dom";
import type { TrainingSession } from "../../types/trainingSession";
import { DashboardSection } from "./DashboardSection";

interface RecentTrainingSectionProps {
  error: boolean;
  recentSessions: TrainingSession[];
  sessions: TrainingSession[] | null;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function displayType(value: string) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export function RecentTrainingSection({
  error,
  recentSessions,
  sessions,
}: RecentTrainingSectionProps) {
  return (
    <DashboardSection
      className="recent-training"
      labelledBy="recent-training-title"
      tone="surface"
    >
      <div className="recent-training-heading">
        <div>
          <p className="eyebrow">Training snapshot</p>
          <h2 id="recent-training-title">Recent training</h2>
          <p className="dashboard-section-support">
            Quickly return to your latest logged sessions.
          </p>
        </div>
        {recentSessions.length > 0 && <Link to="/sessions">View all sessions</Link>}
      </div>

      {!sessions && !error && (
        <div className="dashboard-loading" role="status">
          <span aria-hidden="true" />
          <p>Gathering your recent training</p>
        </div>
      )}

      {error && (
        <div className="dashboard-message error-panel" role="alert">
          <h3>Recent training is unavailable</h3>
          <p>Your training could not be loaded right now. You can still log or view sessions.</p>
        </div>
      )}

      {sessions?.length === 0 && (
        <div className="dashboard-message">
          <h3>No sessions logged yet.</h3>
          <p>Log your first training session to start building your training history.</p>
          <Link className="button primary" to="/sessions/new">Log a session</Link>
        </div>
      )}

      {recentSessions.length > 0 && (
        <div className="dashboard-session-list">
          {recentSessions.map((session) => (
            <article className="dashboard-session-card" key={session.id}>
              <div className="session-card-topline">
                <span className={`status-badge ${session.status.toLowerCase()}`}>
                  {session.status}
                </span>
                <time dateTime={session.sessionDate}>{formatDate(session.sessionDate)}</time>
              </div>
              <p className="session-type">{displayType(session.sessionType)}</p>
              <h3>
                <Link to={`/sessions/${session.id}`}>
                  View session: {session.title}
                </Link>
              </h3>
              <p className="prescription-preview">{session.prescription}</p>
            </article>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
