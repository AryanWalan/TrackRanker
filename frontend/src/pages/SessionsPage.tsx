import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getTrainingSessions } from "../services/trainingSessions";
import { useTrackRankerStore } from "../stores/useTrackRankerStore";
import {
  sessionStatuses,
  sessionTypes,
  type TrainingSession,
} from "../types/trainingSession";

const statusFilters = ["All", ...sessionStatuses] as const;

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
        <div className="training-history-heading-copy">
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
          <h2>No sessions logged yet</h2>
          <p>Log your first training session to start building your training history.</p>
          <Link className="button primary" to="/sessions/new">Log a session</Link>
        </div>
      )}
      {sessions && sessions.length > 0 && (
        <>
          <section className="session-toolbar" aria-label="Filter training sessions">
            <fieldset className="session-status-filter">
              <legend>Status</legend>
              <div className="status-filter-options">
                {statusFilters.map((status) => {
                  const selected = sessionStatusFilter === status;
                  return (
                    <button
                      aria-pressed={selected}
                      className={selected ? "status-filter active" : "status-filter"}
                      key={status}
                      type="button"
                      onClick={() => setSessionStatusFilter(status)}
                    >
                      {selected && <span aria-hidden="true">✓</span>}
                      {status}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <label className="session-type-filter">
              <span>Type</span>
              <select
                value={sessionTypeFilter}
                onChange={(event) =>
                  setSessionTypeFilter(event.target.value as typeof sessionTypeFilter)}
              >
                <option value="All">All types</option>
                {sessionTypes.map((type) => (
                  <option key={type} value={type}>{displayType(type)}</option>
                ))}
              </select>
            </label>
            <div className="session-toolbar-summary">
              <p className="session-result-count" aria-live="polite" role="status">
                {visibleSessions.length} {visibleSessions.length === 1 ? "session" : "sessions"}
              </p>
              {hasActiveFilters && (
                <button
                  className="clear-filter-button"
                  type="button"
                  onClick={resetSessionFilters}
                >
                  Clear filters
                </button>
              )}
            </div>
          </section>

          {visibleSessions.length === 0 ? (
            <div className="state-panel empty-state filtered-empty-state">
              <h2>No sessions match these filters</h2>
              <p>Try changing the session type or status.</p>
              <button className="button primary" type="button" onClick={resetSessionFilters}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="session-list">
              {visibleSessions.map((session) => (
                <article
                  className={`session-card session-card--${session.status.toLowerCase()}`}
                  key={session.id}
                >
                  <div className="session-card-topline">
                    <span className={`status-badge ${session.status.toLowerCase()}`}>
                      {session.status}
                    </span>
                    <time dateTime={session.sessionDate}>{formatDate(session.sessionDate)}</time>
                  </div>
                  <h2>{session.title}</h2>
                  <p className="session-type">{displayType(session.sessionType)}</p>
                  <div className="session-prescription">
                    <p className="session-card-label">Prescription</p>
                    <p className="prescription-preview">{session.prescription}</p>
                  </div>
                  {session.intendedIntensity !== null && (
                    <dl className="session-intensity">
                      <div>
                        <dt>Planned intensity</dt>
                        <dd>{session.intendedIntensity}%</dd>
                      </div>
                    </dl>
                  )}
                  <div className="session-card-actions" aria-label={`Actions for ${session.title}`}>
                    {session.status === "Planned" ? (
                      <>
                        <Link
                          aria-label={`Complete session: ${session.title}`}
                          className="button primary"
                          to={`/sessions/${session.id}/complete`}
                        >
                          Complete session
                        </Link>
                        <Link
                          aria-label={`Edit session: ${session.title}`}
                          className="button secondary"
                          to={`/sessions/${session.id}/edit`}
                        >
                          Edit
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          aria-label={`View session: ${session.title}`}
                          className="button primary"
                          to={`/sessions/${session.id}`}
                        >
                          View session
                        </Link>
                        <Link
                          aria-label={`Repeat session: ${session.title}`}
                          className="button secondary"
                          to={`/sessions/new?copy=${session.id}`}
                        >
                          Repeat
                        </Link>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
