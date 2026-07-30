import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HealthStatus } from "../components/HealthStatus";
import { getProgress, getTrainingSessions } from "../services/trainingSessions";
import type { Progress } from "../types/progress";
import type { TrainingSession } from "../types/trainingSession";

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

export function DashboardPage() {
  const [sessions, setSessions] = useState<TrainingSession[] | null>(null);
  const [sessionsError, setSessionsError] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [progressError, setProgressError] = useState(false);

  useEffect(() => {
    let active = true;
    getTrainingSessions()
      .then((result) => {
        if (active) setSessions(result);
      })
      .catch(() => {
        if (active) setSessionsError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    getProgress()
      .then((result) => {
        if (active) setProgress(result);
      })
      .catch(() => {
        if (active) setProgressError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const recentSessions = useMemo(
    () => sessions
      ? [...sessions]
          .sort((left, right) => right.sessionDate.localeCompare(left.sessionDate))
          .slice(0, 3)
      : [],
    [sessions],
  );

  return (
    <section className="dashboard-page">
      <header className="hero" aria-labelledby="dashboard-title">
        <p className="eyebrow">Sprint training, made clear</p>
        <h1 id="dashboard-title">TrackRanker</h1>
        <p className="tagline">Understand your training. Trust your progress.</p>
      </header>

      <nav className="dashboard-actions" aria-label="Dashboard quick actions">
        <Link className="dashboard-action primary-action" to="/sessions/new">
          <span>Log a session</span>
          <small>Record your prescribed training</small>
        </Link>
        <Link className="dashboard-action" to="/sessions">
          <span>View training</span>
          <small>Review your session history</small>
        </Link>
      </nav>

      <section className="dashboard-rank" aria-labelledby="dashboard-rank-title">
        <div>
          <p className="eyebrow">Training process</p>
          <h2 id="dashboard-rank-title">
            {progress ? `TrackRank ${progress.trackRank}` : "TrackRank"}
          </h2>
        </div>
        {!progress && !progressError && <p role="status">Calculating progress…</p>}
        {progressError && <p>Progress is unavailable right now.</p>}
        {progress && (
          <>
            <div className="dashboard-rank-values">
              <strong>{progress.totalXp} XP</strong>
              <span>{progress.currentRankXp} / {progress.xpPerRank} to next rank</span>
            </div>
            <Link className="button secondary" to="/progress">View progress</Link>
          </>
        )}
      </section>

      <section className="recent-training" aria-labelledby="recent-training-title">
        <div className="recent-training-heading">
          <div>
            <p className="eyebrow">Training snapshot</p>
            <h2 id="recent-training-title">Recent training</h2>
          </div>
          {recentSessions.length > 0 && <Link to="/sessions">View all sessions</Link>}
        </div>

        {!sessions && !sessionsError && (
          <div className="dashboard-loading" role="status">
            <span aria-hidden="true" />
            <p>Gathering your recent training</p>
          </div>
        )}

        {sessionsError && (
          <div className="dashboard-message error-panel" role="alert">
            <h3>Recent training is unavailable</h3>
            <p>Your training could not be loaded right now. You can still log or view sessions.</p>
          </div>
        )}

        {sessions?.length === 0 && (
          <div className="dashboard-message">
            <h3>No sessions logged yet.</h3>
            <p>Add your first session to start building your training history.</p>
            <Link className="button primary" to="/sessions/new">Log your first session</Link>
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
      </section>

      <aside className="system-status" aria-label="System status">
        <HealthStatus />
      </aside>
    </section>
  );
}
