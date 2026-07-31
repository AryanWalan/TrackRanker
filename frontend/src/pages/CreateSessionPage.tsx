import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { SessionForm } from "../components/SessionForm";
import {
  createTrainingSession,
  getTrainingSession,
} from "../services/trainingSessions";
import type {
  TrainingSession,
  TrainingSessionInput,
} from "../types/trainingSession";

type CopyState =
  | { status: "blank" }
  | { status: "loading" }
  | { status: "loaded"; source: TrainingSession; initialValue: TrainingSessionInput }
  | { status: "error" };

function localCalendarDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function repeatInitialValue(source: TrainingSession): TrainingSessionInput {
  return {
    title: "",
    sessionType: source.sessionType,
    sessionDate: localCalendarDate(),
    prescription: source.prescription,
    purpose: source.purpose,
    focusCue: source.focusCue,
    successCriteria: source.successCriteria,
    intendedIntensity: source.intendedIntensity,
    coachNotes: source.coachNotes,
    status: "Planned",
  };
}

export function CreateSessionPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasCopySource = searchParams.has("copy");
  const copyId = searchParams.get("copy") ?? "";
  const [copyState, setCopyState] = useState<CopyState>(
    hasCopySource ? { status: "loading" } : { status: "blank" },
  );

  useEffect(() => {
    let active = true;

    if (!hasCopySource) {
      setCopyState({ status: "blank" });
      return () => {
        active = false;
      };
    }

    setCopyState({ status: "loading" });
    getTrainingSession(copyId)
      .then((source) => {
        if (active) {
          setCopyState({
            status: "loaded",
            source,
            initialValue: repeatInitialValue(source),
          });
        }
      })
      .catch(() => {
        if (active) {
          setCopyState({ status: "error" });
        }
      });

    return () => {
      active = false;
    };
  }, [copyId, hasCopySource]);

  if (copyState.status === "loading") {
    return (
      <p className="state-panel" role="status">
        Loading previous session…
      </p>
    );
  }

  if (copyState.status === "error") {
    return (
      <div className="state-panel error-panel" role="alert">
        <h1>That session couldn't be loaded.</h1>
        <p>You can still create a new session without copied details.</p>
        <div className="form-actions">
          <button
            className="button primary"
            type="button"
            onClick={() => {
              setCopyState({ status: "blank" });
              setSearchParams({}, { replace: true });
            }}
          >
            Create a blank session
          </button>
          <Link className="button secondary" to="/sessions">Back to sessions</Link>
        </div>
      </div>
    );
  }

  return (
    <section className="form-page">
      <div className="page-heading compact">
        <div>
          <p className="eyebrow">New training</p>
          <h1>Add Session</h1>
          <p>Capture what you are doing and the reason behind the work.</p>
          {copyState.status === "loaded" && (
            <p className="repeat-session-context">
              Starting from a previous session: <strong>{copyState.source.title}</strong>
            </p>
          )}
        </div>
      </div>
      <SessionForm
        initialValue={
          copyState.status === "loaded" ? copyState.initialValue : undefined
        }
        submitLabel="Create session"
        cancelTo="/sessions"
        onSubmit={async (input) => {
          const session = await createTrainingSession(input);
          navigate(`/sessions/${session.id}`);
        }}
      />
    </section>
  );
}
