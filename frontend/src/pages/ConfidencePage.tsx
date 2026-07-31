import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getConfidenceHistory } from "../services/trainingSessions";
import { useTrackRankerStore } from "../stores/useTrackRankerStore";
import type { ConfidenceHistory, ConfidenceHistoryEntry } from "../types/confidenceHistory";
import { sessionTypes, type SessionType } from "../types/trainingSession";

const typeLabels: Record<SessionType, string> = {
  Acceleration: "Acceleration",
  MaxVelocity: "Max Velocity",
  SpeedEndurance: "Speed Endurance",
  SpecialEndurance: "Special Endurance",
  Tempo: "Tempo",
  Starts: "Starts",
  Competition: "Competition",
  Recovery: "Recovery",
  Other: "Other",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function confidenceChange(entry: ConfidenceHistoryEntry) {
  if (entry.confidenceBefore === null || entry.confidenceAfter === null) return null;
  const delta = entry.confidenceAfter - entry.confidenceBefore;
  if (delta === 0) return "No change";
  return delta > 0 ? `+${delta}` : `${delta}`;
}

function ConfidenceChart({ entries }: { entries: ConfidenceHistoryEntry[] }) {
  const chartEntries = [...entries]
    .filter((entry) => entry.confidenceBefore !== null || entry.confidenceAfter !== null)
    .reverse();
  const width = 720;
  const height = 260;
  const left = 42;
  const right = 18;
  const top = 18;
  const bottom = 42;
  const x = (index: number) =>
    chartEntries.length === 1
      ? width / 2
      : left + index * ((width - left - right) / (chartEntries.length - 1));
  const y = (value: number) =>
    top + (5 - value) * ((height - top - bottom) / 4);
  const points = (key: "confidenceBefore" | "confidenceAfter") =>
    chartEntries.flatMap((entry, index) => {
      const value = entry[key];
      return value === null ? [] : [`${x(index)},${y(value)}`];
    }).join(" ");
  const description = chartEntries.map((entry) => {
    const before = entry.confidenceBefore === null ? "not recorded" : `${entry.confidenceBefore} of 5`;
    const after = entry.confidenceAfter === null ? "not recorded" : `${entry.confidenceAfter} of 5`;
    return `${formatDate(entry.sessionDate)}: before ${before}, after ${after}.`;
  }).join(" ");

  if (chartEntries.length === 0) return null;

  return (
    <section className="confidence-chart-card" aria-labelledby="confidence-chart-title">
      <div>
        <p className="eyebrow">Over time</p>
        <h2 id="confidence-chart-title">Before and after training</h2>
        <p className="chart-description" id="confidence-chart-description">{description}</p>
      </div>
      <div className="chart-legend" aria-hidden="true">
        <span><i className="legend-before" />Before</span>
        <span><i className="legend-after" />After</span>
      </div>
      <div className="confidence-chart-scroll">
        <svg
          className="confidence-chart"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby="confidence-chart-title confidence-chart-description"
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <g key={value}>
              <line x1={left} x2={width - right} y1={y(value)} y2={y(value)} />
              <text x={left - 12} y={y(value) + 4}>{value}</text>
            </g>
          ))}
          <polyline className="chart-line before" points={points("confidenceBefore")} />
          <polyline className="chart-line after" points={points("confidenceAfter")} />
          {chartEntries.map((entry, index) => (
            <g key={entry.trainingSessionId}>
              {entry.confidenceBefore !== null && (
                <circle className="chart-point before" cx={x(index)} cy={y(entry.confidenceBefore)} r="5">
                  <title>{`${entry.sessionTitle}, before: ${entry.confidenceBefore} of 5`}</title>
                </circle>
              )}
              {entry.confidenceAfter !== null && (
                <rect className="chart-point after" x={x(index) - 5} y={y(entry.confidenceAfter) - 5} width="10" height="10">
                  <title>{`${entry.sessionTitle}, after: ${entry.confidenceAfter} of 5`}</title>
                </rect>
              )}
              <text className="chart-date" x={x(index)} y={height - 13}>
                {new Date(`${entry.sessionDate}T00:00:00Z`).toLocaleDateString("en-NZ", {
                  day: "numeric", month: "short", timeZone: "UTC",
                })}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}

function EvidenceCard({ entry }: { entry: ConfidenceHistoryEntry }) {
  const reflectionFields = [
    ["What went well", entry.wentWell],
    ["What improved", entry.improved],
    ["Next focus", entry.nextFocus],
    ["Coach feedback", entry.coachFeedback],
    ["What was difficult", entry.wasDifficult],
  ].filter((field): field is [string, string] => Boolean(field[1]));
  const change = confidenceChange(entry);
  const hasBefore = entry.confidenceBefore !== null;
  const hasAfter = entry.confidenceAfter !== null;

  return (
    <article className="confidence-evidence-card">
      <header>
        <h3>{entry.sessionTitle}</h3>
        <p className="evidence-session-meta">
          <span>{typeLabels[entry.sessionType]}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={entry.sessionDate}>{formatDate(entry.sessionDate)}</time>
        </p>
      </header>
      {(hasBefore || hasAfter) && (
        <section
          className="evidence-confidence"
          aria-label={[
            hasBefore ? `Confidence before: ${entry.confidenceBefore} out of 5` : null,
            hasAfter ? `Confidence after: ${entry.confidenceAfter} out of 5` : null,
          ].filter(Boolean).join(". ")}
        >
          <h4>Confidence</h4>
          <p className="confidence-comparison">
            {hasBefore && <span><strong>{entry.confidenceBefore} / 5</strong> before</span>}
            {hasBefore && hasAfter && <span className="confidence-arrow" aria-hidden="true">→</span>}
            {hasAfter && <span><strong>{entry.confidenceAfter} / 5</strong> after</span>}
          </p>
          {change !== null && <p className="confidence-change">Change {change}</p>}
        </section>
      )}
      {reflectionFields.length > 0 && (
        <div className="evidence-reflections">
          {reflectionFields.map(([label, value]) => (
            <section key={label}>
              <h4>{label}</h4>
              <p>{value}</p>
            </section>
          ))}
        </div>
      )}
      <Link className="evidence-link" to={`/sessions/${entry.trainingSessionId}`}>View session</Link>
    </article>
  );
}

export function ConfidencePage() {
  const [history, setHistory] = useState<ConfidenceHistory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const filter = useTrackRankerStore((state) => state.confidenceTypeFilter);
  const setFilter = useTrackRankerStore((state) => state.setConfidenceTypeFilter);
  const resetFilter = useTrackRankerStore((state) => state.resetConfidenceFilter);

  useEffect(() => {
    getConfidenceHistory()
      .then(setHistory)
      .catch(() => setError("Confidence history could not be loaded. Please try again."));
  }, []);

  const visibleEntries = useMemo(
    () => history?.entries.filter((entry) => filter === "All" || entry.sessionType === filter) ?? [],
    [filter, history],
  );

  if (error) {
    return <section className="state-panel error-panel" role="alert"><h1>Your Confidence Evidence</h1><p>{error}</p></section>;
  }
  if (!history) {
    return <section className="state-panel" aria-live="polite"><h1>Your Confidence Evidence</h1><p>Loading confidence history…</p></section>;
  }
  if (history.entries.length === 0) {
    return (
      <section className="confidence-page">
        <header className="page-heading compact">
          <div>
            <p className="eyebrow">Evidence from your training</p>
            <h1>Your Confidence Evidence</h1>
            <p>
              See what your previous sessions say about your preparation. Complete sessions
              and add short reflections to build your confidence history.
            </p>
          </div>
        </header>
        <div className="state-panel empty-state confidence-empty-state">
          <h2>Build your confidence history</h2>
          <p>
            After training, log how the session went, record your confidence, and add a short
            reflection. TrackRanker will help you look back at evidence from your own training.
          </p>
          <Link className="button primary" to="/sessions">View sessions</Link>
        </div>
      </section>
    );
  }

  const hasPairedConfidence = history.sessionsWithConfidence > 0;
  const hasAnyConfidence = history.entries.some(
    (entry) => entry.confidenceBefore !== null || entry.confidenceAfter !== null,
  );
  return (
    <section className="confidence-page">
      <header className="page-heading compact">
        <div>
          <p className="eyebrow">Evidence from your training</p>
          <h1>Your Confidence Evidence</h1>
          <p>
            See what your previous sessions say about your preparation. Complete sessions
            and add short reflections to build your confidence history.
          </p>
        </div>
      </header>

      <dl className="confidence-metrics" aria-label="Confidence history summary">
        <div><dt>Sessions with reflections</dt><dd>{history.totalReflectedSessions}</dd></div>
        {hasPairedConfidence && <div><dt>Confidence higher after</dt><dd>{history.sessionsImproved} of {history.sessionsWithConfidence} sessions</dd></div>}
        {history.averageConfidenceBefore !== null && <div><dt>Average before</dt><dd>{history.averageConfidenceBefore.toFixed(1)} / 5</dd></div>}
        {history.averageConfidenceAfter !== null && <div><dt>Average after</dt><dd>{history.averageConfidenceAfter.toFixed(1)} / 5</dd></div>}
      </dl>

      {hasAnyConfidence
        ? <ConfidenceChart entries={history.entries} />
        : <p className="partial-confidence-note">Confidence comparisons will appear after both before and after ratings are logged. Your reflection evidence is still shown below.</p>}

      <section className="confidence-history" aria-labelledby="evidence-heading">
        <div className="history-heading">
          <div><p className="eyebrow">Previous reflections</p><h2 id="evidence-heading">Your evidence</h2></div>
          <label className="history-filter">Session type
            <select value={filter} onChange={(event) => setFilter(event.target.value as SessionType | "All")}>
              <option value="All">All</option>
              {sessionTypes.map((type) => <option key={type} value={type}>{typeLabels[type]}</option>)}
            </select>
          </label>
          {filter !== "All" && (
            <button className="button secondary" type="button" onClick={resetFilter}>
              Clear confidence filter
            </button>
          )}
        </div>
        {visibleEntries.length > 0
          ? <div className="confidence-evidence-list">{visibleEntries.map((entry) => <EvidenceCard key={entry.trainingSessionId} entry={entry} />)}</div>
          : <p className="filter-empty">No confidence evidence for this session type.</p>}
      </section>
    </section>
  );
}
