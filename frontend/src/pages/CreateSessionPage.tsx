import { useNavigate } from "react-router-dom";
import { SessionForm } from "../components/SessionForm";
import { createTrainingSession } from "../services/trainingSessions";

export function CreateSessionPage() {
  const navigate = useNavigate();

  return (
    <section className="form-page">
      <div className="page-heading compact">
        <div>
          <p className="eyebrow">New training</p>
          <h1>Add Session</h1>
          <p>Capture what you are doing and the reason behind the work.</p>
        </div>
      </div>
      <SessionForm
        submitLabel="Create Session"
        cancelTo="/sessions"
        onSubmit={async (input) => {
          const session = await createTrainingSession(input);
          navigate(`/sessions/${session.id}`);
        }}
      />
    </section>
  );
}
