import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SessionForm } from "../components/SessionForm";
import {
  getTrainingSession,
  updateTrainingSession,
} from "../services/trainingSessions";
import type { TrainingSessionInput } from "../types/trainingSession";

export function EditSessionPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [initialValue, setInitialValue] = useState<TrainingSessionInput | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getTrainingSession(id)
      .then((session) => {
        setInitialValue({
          title: session.title,
          sessionType: session.sessionType,
          sessionDate: session.sessionDate,
          prescription: session.prescription,
          purpose: session.purpose,
          focusCue: session.focusCue,
          successCriteria: session.successCriteria,
          intendedIntensity: session.intendedIntensity,
          coachNotes: session.coachNotes,
          status: session.status,
        });
      })
      .catch(() => setError(true));
  }, [id]);

  if (error) {
    return (
      <div className="state-panel error-panel">
        <h1>Session could not be loaded</h1>
        <Link className="button secondary" to="/sessions">Back to Sessions</Link>
      </div>
    );
  }

  if (!initialValue) {
    return <p className="state-panel" role="status">Loading session…</p>;
  }

  return (
    <section className="form-page">
      <div className="page-heading compact">
        <div>
          <p className="eyebrow">Update training</p>
          <h1>Edit Session</h1>
          <p>Keep the prescription and intended training outcome accurate.</p>
        </div>
      </div>
      <SessionForm
        initialValue={initialValue}
        submitLabel="Save changes"
        cancelTo={`/sessions/${id}`}
        onSubmit={async (input) => {
          await updateTrainingSession(id, input);
          navigate(`/sessions/${id}`);
        }}
      />
    </section>
  );
}
