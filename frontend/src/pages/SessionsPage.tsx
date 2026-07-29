import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTrainingSessions } from "../services/trainingSessions";
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

export function SessionsPage() {
  const [sessions, setSessions] = useState<TrainingSession[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getTrainingSessions()
      .then((result) => {
        if (active) setSessions(result);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="sessions-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Training</p>
          <h1>Training Sessions</h1>
          <p>Keep each prescription, purpose, and focus point clear in one place.</p>
        </div>
        <Link className="button primary" to="/sessions/new">Add Session</Link>
      </div>

      {!sessions && !error && <p className="state-panel" role="status">Loading sessions…</p>}
      {error && (
        <div className="state-panel error-panel" role="alert">
          <h2>Sessions could not be loaded</h2>
          <p>Check that the TrackRanker API is running, then refresh this page.</p>
        </div>
      )}
      {sessions?.length === 0 && (
        <div className="state-panel empty-state">
          <h2>No sessions yet.</h2>
          <p>Add your first training session to start building clarity around your training.</p>
          <Link className="button primary" to="/sessions/new">Add Session</Link>
        </div>
      )}
      {sessions && sessions.length > 0 && (
        <div className="session-list">
          {sessions.map((session) => (
            <article className="session-card" key={session.id}>
              <div className="session-card-topline">
                <span className={`status-badge ${session.status.toLowerCase()}`}>
                  {session.status}
                </span>
                <time dateTime={session.sessionDate}>{formatDate(session.sessionDate)}</time>
              </div>
              <h2>
                <Link to={`/sessions/${session.id}`}>{session.title}</Link>
              </h2>
              <p className="session-type">{displayType(session.sessionType)}</p>
              <p className="prescription-preview">{session.prescription}</p>
              {session.intendedIntensity !== null && (
                <p className="intensity">Intended intensity <strong>{session.intendedIntensity}%</strong></p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
