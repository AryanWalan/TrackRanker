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
    <div className="dashboard-page">
      <section
        className="dashboard-section dashboard-introduction"
        aria-labelledby="dashboard-title"
      >
        <header className="hero">
          <p className="eyebrow">For 100m, 200m and 400m sprinters</p>
          <h1 id="dashboard-title">TrackRanker</h1>
          <p className="tagline">Training clarity and confidence for 100m, 200m and 400m sprinters.</p>
          <p className="hero-support">
            Log what your coach gives you, understand your sessions, reflect on how they went,
            and build confidence from your own training.
          </p>
        </header>
      </section>

      <section
        className="dashboard-section dashboard-workflow"
        aria-labelledby="dashboard-workflow-title"
      >
        <div className="dashboard-workflow-heading">
          <p className="eyebrow">Start here</p>
          <h2 id="dashboard-workflow-title">How TrackRanker works</h2>
        </div>
        <ol>
          <li>
            <span aria-hidden="true">1</span>
            <div>
              <h3>Log your session</h3>
              <p>Add the training session your coach has prescribed.</p>
            </div>
          </li>
          <li>
            <span aria-hidden="true">2</span>
            <div>
              <h3>Complete and reflect</h3>
              <p>Record how the session went, what you learned, and how confident you felt.</p>
            </div>
          </li>
          <li>
            <span aria-hidden="true">3</span>
            <div>
              <h3>Build confidence</h3>
              <p>Look back at your training evidence, reflections, and progress.</p>
            </div>
          </li>
        </ol>
      </section>

      <section
        className="dashboard-section dashboard-start"
        aria-labelledby="dashboard-start-title"
      >
        <div className="dashboard-section-heading">
          <p className="eyebrow">What do I do?</p>
          <h2 id="dashboard-start-title">Start training</h2>
        </div>
        <nav className="dashboard-actions" aria-label="Dashboard quick actions">
          <Link className="dashboard-action primary-action" to="/sessions/new">
            <span>Log a session</span>
            <small>Add today's or an upcoming training session.</small>
          </Link>
          <Link className="dashboard-action" to="/sessions">
            <span>Training history</span>
            <small>View, repeat, and manage sessions you've already logged.</small>
          </Link>
        </nav>
      </section>

      <section
        className="dashboard-section dashboard-rank"
        aria-labelledby="dashboard-rank-title"
      >
        <div>
          <p className="eyebrow">Training process</p>
          <h2 id="dashboard-rank-title">
            {progress ? `TrackRank ${progress.trackRank}` : "TrackRank"}
          </h2>
          <p className="dashboard-rank-context">
            Engagement with your training process, not sprint ability.
          </p>
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

      <section
        className="dashboard-section recent-training"
        aria-labelledby="recent-training-title"
      >
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

        <aside className="system-status" aria-label="System status">
          <HealthStatus />
        </aside>
      </section>
    </div>
  );
}
