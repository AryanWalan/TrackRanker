import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { SessionForm } from "../components/SessionForm";
import {
  createTrainingSession,
  getTrainingSession,
} from "../services/trainingSessions";
import { useTrackRankerStore } from "../stores/useTrackRankerStore";
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
  const sessionDraft = useTrackRankerStore((state) => state.sessionDraft);
  const setSessionDraft = useTrackRankerStore((state) => state.setSessionDraft);
  const clearSessionDraft = useTrackRankerStore((state) => state.clearSessionDraft);
  const restoredDraftAtEntry = useRef(!hasCopySource && sessionDraft !== null);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [formVersion, setFormVersion] = useState(0);
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
          const initialValue = repeatInitialValue(source);
          setSessionDraft(initialValue);
          setCopyState({
            status: "loaded",
            source,
            initialValue,
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
  }, [copyId, hasCopySource, setSessionDraft]);

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
              clearSessionDraft();
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
          {restoredDraftAtEntry.current && copyState.status === "blank" && (
            <p className="draft-restored-status" role="status">Draft restored</p>
          )}
        </div>
      </div>
      {sessionDraft && (
        <div className="draft-actions">
          {!confirmingClear ? (
            <button
              className="button secondary"
              type="button"
              onClick={() => setConfirmingClear(true)}
            >
              Clear draft
            </button>
          ) : (
            <div
              className="draft-clear-confirmation"
              role="alertdialog"
              aria-labelledby="clear-draft-title"
            >
              <div>
                <h2 id="clear-draft-title">Clear this session draft?</h2>
                <p>Your unsaved session details will be removed from this browser.</p>
              </div>
              <div className="form-actions">
                <button
                  className="button danger"
                  type="button"
                  onClick={() => {
                    clearSessionDraft();
                    setConfirmingClear(false);
                    setCopyState({ status: "blank" });
                    setSearchParams({}, { replace: true });
                    setFormVersion((version) => version + 1);
                  }}
                >
                  Confirm clear draft
                </button>
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => setConfirmingClear(false)}
                >
                  Keep draft
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <SessionForm
        key={formVersion}
        initialValue={
          copyState.status === "loaded"
            ? copyState.initialValue
            : sessionDraft ?? undefined
        }
        submitLabel="Create session"
        cancelTo="/sessions"
        onChange={setSessionDraft}
        onSubmit={async (input) => {
          const session = await createTrainingSession(input);
          clearSessionDraft();
          navigate(`/sessions/${session.id}`);
        }}
      />
    </section>
  );
}
