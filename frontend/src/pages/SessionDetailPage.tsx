import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteTrainingSession,
  getTrainingSession,
} from "../services/trainingSessions";
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

export function SessionDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [error, setError] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getTrainingSession(id)
      .then(setSession)
      .catch(() => setError(true));
  }, [id]);

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

  return (
    <article className="session-detail">
      <Link className="back-link" to="/sessions">← Back to Sessions</Link>
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
        <DetailSection title="Why you're doing it" value={session.purpose} />
        <DetailSection title="Focus" value={session.focusCue} />
        <DetailSection title="What success looks like" value={session.successCriteria} />
        <DetailSection title="Coach notes" value={session.coachNotes} />
      </div>

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
    </article>
  );
}
