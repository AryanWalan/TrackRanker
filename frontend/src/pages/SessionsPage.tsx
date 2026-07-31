import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getTrainingSessions } from "../services/trainingSessions";
import { useTrackRankerStore } from "../stores/useTrackRankerStore";
import {
  sessionStatuses,
  sessionTypes,
  type TrainingSession,
} from "../types/trainingSession";

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
  const sessionTypeFilter = useTrackRankerStore((state) => state.sessionTypeFilter);
  const sessionStatusFilter = useTrackRankerStore((state) => state.sessionStatusFilter);
  const setSessionTypeFilter = useTrackRankerStore((state) => state.setSessionTypeFilter);
  const setSessionStatusFilter = useTrackRankerStore((state) => state.setSessionStatusFilter);
  const resetSessionFilters = useTrackRankerStore((state) => state.resetSessionFilters);

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

  const visibleSessions = useMemo(
    () => sessions?.filter((session) =>
      (sessionTypeFilter === "All" || session.sessionType === sessionTypeFilter)
      && (sessionStatusFilter === "All" || session.status === sessionStatusFilter)) ?? [],
    [sessionStatusFilter, sessionTypeFilter, sessions],
  );
  const hasActiveFilters = sessionTypeFilter !== "All" || sessionStatusFilter !== "All";

  return (
    <section className="sessions-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Training</p>
          <h1>Training history</h1>
          <p>View, repeat, and manage the sessions you have already logged.</p>
        </div>
        <Link className="button primary" to="/sessions/new">Log a session</Link>
      </div>

      {!sessions && !error && <p className="state-panel" role="status">Loading sessions…</p>}
      {error && (
        <div className="state-panel error-panel" role="alert">
          <h2>Sessions could not be loaded</h2>
          <p>Your training could not be loaded right now. Refresh and try again.</p>
        </div>
      )}
      {sessions?.length === 0 && (
        <div className="state-panel empty-state">
          <h2>No sessions logged yet.</h2>
          <p>Log your first training session to start building your training history.</p>
          <Link className="button primary" to="/sessions/new">Log a session</Link>
        </div>
      )}
      {sessions && sessions.length > 0 && (
        <>
          <section className="session-filters" aria-label="Filter training sessions">
            <label>
              <span>Type</span>
              <select
                value={sessionTypeFilter}
                onChange={(event) =>
                  setSessionTypeFilter(event.target.value as typeof sessionTypeFilter)}
              >
                <option value="All">All</option>
                {sessionTypes.map((type) => (
                  <option key={type} value={type}>{displayType(type)}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Status</span>
              <select
                value={sessionStatusFilter}
                onChange={(event) =>
                  setSessionStatusFilter(event.target.value as typeof sessionStatusFilter)}
              >
                <option value="All">All</option>
                {sessionStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
            <p className="session-result-count" aria-live="polite">
              {visibleSessions.length} {visibleSessions.length === 1 ? "session" : "sessions"}
            </p>
            {hasActiveFilters && (
              <button
                className="button secondary"
                type="button"
                onClick={resetSessionFilters}
              >
                Clear filters
              </button>
            )}
          </section>

          {visibleSessions.length === 0 ? (
            <div className="state-panel empty-state filtered-empty-state">
              <h2>No sessions match these filters.</h2>
              <p>Clear the filters to see your full training history.</p>
              <button className="button primary" type="button" onClick={resetSessionFilters}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="session-list">
              {visibleSessions.map((session) => (
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
        </>
      )}
    </section>
  );
}
