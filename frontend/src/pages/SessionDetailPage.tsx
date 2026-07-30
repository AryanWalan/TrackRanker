import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ProgressEarnedFeedback } from "../components/ProgressEarnedFeedback";
import {
  ApiError,
  deleteSessionCompletion,
  deleteTrainingSession,
  getSessionCompletion,
  getTrainingSession,
} from "../services/trainingSessions";
import type { SessionCompletion } from "../types/sessionCompletion";
import type { CompletionNavigationState } from "../types/completionProgressFeedback";
import type { TrainingSession } from "../types/trainingSession";

function DetailSection({
  title,
  value,
}: {
  title: string;
  value: string | null;
}) {
  return (
    <section className="detail-section">
      <h2>{title}</h2>
      <p className={value ? undefined : "muted-empty"}>
        {value || "Not provided for this session."}
      </p>
    </section>
  );
}

function confidenceText(value: number | null) {
  if (value === null) return "Not provided";
  const labels = ["Very low", "Low", "Neutral", "Good", "Very confident"];
  return `${value} — ${labels[value - 1]}`;
}

export function SessionDetailPage() {
  const { id = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [progressFeedback] = useState(
    () => (location.state as CompletionNavigationState | null)?.progressFeedback ?? null,
  );
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [completion, setCompletion] = useState<SessionCompletion | null | undefined>();
  const [completionError, setCompletionError] = useState(false);
  const [error, setError] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingCompletionDelete, setConfirmingCompletionDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingCompletion, setDeletingCompletion] = useState(false);

  useEffect(() => {
    getTrainingSession(id)
      .then(setSession)
      .catch(() => setError(true));
    getSessionCompletion(id)
      .then(setCompletion)
      .catch((requestError: unknown) => {
        if (requestError instanceof ApiError && requestError.status === 404) {
          setCompletion(null);
        } else {
          setCompletionError(true);
        }
      });
  }, [id]);

  useEffect(() => {
    if ((location.state as CompletionNavigationState | null)?.progressFeedback) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  if (error) {
    return (
      <div className="state-panel error-panel">
        <h1>Session not found</h1>
        <p>The session may have been removed or the link may be incorrect.</p>
        <Link className="button secondary" to="/sessions">Back to Sessions</Link>
      </div>
    );
  }

  if (!session) {
    return <p className="state-panel" role="status">Loading session…</p>;
  }

  const hasPlannedClarity = Boolean(
    session.purpose
    || session.focusCue
    || session.successCriteria
    || session.coachNotes,
  );

  return (
    <article className="session-detail">
      <Link className="back-link" to="/sessions">← Back to Sessions</Link>
      {progressFeedback && <ProgressEarnedFeedback feedback={progressFeedback} />}
      <header className="detail-header">
        <div>
          <p className="eyebrow">Session</p>
          <h1>{session.title}</h1>
          <div className="detail-meta">
            <span>{session.sessionType.replace(/([a-z])([A-Z])/g, "$1 $2")}</span>
            <time dateTime={session.sessionDate}>{session.sessionDate}</time>
            <span>{session.status}</span>
            {session.intendedIntensity !== null && <span>{session.intendedIntensity}% intensity</span>}
          </div>
        </div>
        <div className="detail-actions">
          <Link className="button secondary" to={`/sessions/${id}/edit`}>Edit Session</Link>
          <button className="button danger" type="button" onClick={() => setConfirmingDelete(true)}>
            Delete Session
          </button>
        </div>
      </header>

      <div className="clarity-grid">
        <DetailSection title="Prescription" value={session.prescription} />
        {session.purpose && (
          <DetailSection title="Why you're doing it" value={session.purpose} />
        )}
        {session.focusCue && <DetailSection title="Focus" value={session.focusCue} />}
        {session.successCriteria && (
          <DetailSection title="What success looks like" value={session.successCriteria} />
        )}
        {session.coachNotes && (
          <DetailSection title="Coach notes" value={session.coachNotes} />
        )}
        {!hasPlannedClarity && (
          <section className="clarity-empty">
            <div>
              <h2>Want more clarity?</h2>
              <p>Add a purpose, focus cue, or success criteria when it would help.</p>
            </div>
            <Link className="button secondary" to={`/sessions/${id}/edit`}>
              Add session clarity
            </Link>
          </section>
        )}
      </div>

      <section className="completed-session" aria-labelledby="completed-session-title">
        <div className="completed-session-heading">
          <div>
            <p className="eyebrow">Actual outcome</p>
            <h2 id="completed-session-title">Completed session</h2>
          </div>
          {completion && (
            <div className="detail-actions">
              <Link className="button secondary" to={`/sessions/${id}/complete`}>
                Edit completed session
              </Link>
              <button
                className="button danger"
                type="button"
                onClick={() => setConfirmingCompletionDelete(true)}
              >
                Delete completed session
              </button>
            </div>
          )}
        </div>

        {completion === undefined && !completionError && (
          <p role="status">Loading completed-session outcome…</p>
        )}
        {completionError && (
          <p className="form-error" role="alert">
            The completed-session outcome could not be loaded.
          </p>
        )}
        {completion === null && (
          <div className="completion-empty">
            <p>You haven't logged the outcome of this session yet.</p>
            <Link className="button primary" to={`/sessions/${id}/complete`}>
              Log completed session
            </Link>
          </div>
        )}
        {completion && (
          <>
            <dl className="completion-ratings">
              <div>
                <dt>Actual intensity</dt>
                <dd>{completion.actualIntensity}/10</dd>
              </div>
              <div>
                <dt>Perceived difficulty</dt>
                <dd>{completion.perceivedDifficulty}/10</dd>
              </div>
              <div>
                <dt>Completed</dt>
                <dd>
                  <time dateTime={completion.completedAtUtc}>
                    {new Date(completion.completedAtUtc).toLocaleString("en-NZ")}
                  </time>
                </dd>
              </div>
            </dl>

            <section className="completion-block">
              <h3>Repetition results</h3>
              {completion.repetitionResults.length === 0 ? (
                <p className="muted-empty">No timed repetitions were recorded.</p>
              ) : (
                <div className="result-table-wrap">
                  <table className="result-table">
                    <thead>
                      <tr>
                        <th>Set</th>
                        <th>Rep</th>
                        <th>Distance</th>
                        <th>Time</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completion.repetitionResults.map((result, index) => (
                        <tr key={`${result.setNumber}-${result.repetitionNumber}-${index}`}>
                          <td>{result.setNumber}</td>
                          <td>{result.repetitionNumber}</td>
                          <td>{result.distanceMetres}m</td>
                          <td>{result.timeSeconds}s</td>
                          <td>{result.notes || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <div className="reflection-grid">
              <DetailSection title="What went well?" value={completion.reflection.wentWell} />
              <DetailSection title="What improved today?" value={completion.reflection.improved} />
              <DetailSection title="What felt difficult?" value={completion.reflection.wasDifficult} />
              <DetailSection title="Next focus" value={completion.reflection.nextFocus} />
              <DetailSection title="Coach feedback" value={completion.reflection.coachFeedback} />
            </div>
            <dl className="confidence-summary">
              <div>
                <dt>Confidence before</dt>
                <dd>{confidenceText(completion.reflection.confidenceBefore)}</dd>
              </div>
              <div>
                <dt>Confidence after</dt>
                <dd>{confidenceText(completion.reflection.confidenceAfter)}</dd>
              </div>
            </dl>
          </>
        )}
      </section>

      {confirmingDelete && (
        <div className="confirm-panel" role="alertdialog" aria-labelledby="delete-title">
          <div>
            <h2 id="delete-title">Delete this session?</h2>
            <p>This removes the training session permanently.</p>
          </div>
          <div className="form-actions">
            <button
              className="button danger"
              type="button"
              disabled={deleting}
              onClick={async () => {
                setDeleting(true);
                try {
                  await deleteTrainingSession(id);
                  navigate("/sessions");
                } catch {
                  setDeleting(false);
                  setConfirmingDelete(false);
                  setError(true);
                }
              }}
            >
              {deleting ? "Deleting…" : "Confirm Delete"}
            </button>
            <button className="button secondary" type="button" onClick={() => setConfirmingDelete(false)}>
              Keep Session
            </button>
          </div>
        </div>
      )}

      {confirmingCompletionDelete && (
        <div
          className="confirm-panel completion-delete-confirm"
          role="alertdialog"
          aria-labelledby="completion-delete-title"
        >
          <div>
            <h2 id="completion-delete-title">Delete completed-session record?</h2>
            <p>
              This removes only the recorded outcome and reflection. The planned
              training session will remain.
            </p>
          </div>
          <div className="form-actions">
            <button
              className="button danger"
              type="button"
              disabled={deletingCompletion}
              onClick={async () => {
                setDeletingCompletion(true);
                try {
                  await deleteSessionCompletion(id);
                  setCompletion(null);
                  setConfirmingCompletionDelete(false);
                  setDeletingCompletion(false);
                } catch {
                  setDeletingCompletion(false);
                  setConfirmingCompletionDelete(false);
                  setCompletionError(true);
                }
              }}
            >
              {deletingCompletion ? "Deleting…" : "Confirm completion deletion"}
            </button>
            <button
              className="button secondary"
              type="button"
              onClick={() => setConfirmingCompletionDelete(false)}
            >
              Keep completed session
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
