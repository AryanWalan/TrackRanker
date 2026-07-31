import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import type {
  RepetitionResult,
  SessionCompletionInput,
  SessionReflection,
} from "../types/sessionCompletion";

interface SessionCompletionFormProps {
  initialValue?: SessionCompletionInput;
  submitLabel: string;
  cancelTo: string;
  onSubmit: (input: SessionCompletionInput) => Promise<void>;
}

interface FormValues {
  actualIntensity: number | null;
  perceivedDifficulty: number | null;
  repetitionResults: RepetitionResult[];
  reflection: SessionReflection;
}

const emptyReflection: SessionReflection = {
  wentWell: null,
  improved: null,
  wasDifficult: null,
  nextFocus: null,
  coachFeedback: null,
  confidenceBefore: null,
  confidenceAfter: null,
};

function blankRepetition(nextNumber: number): RepetitionResult {
  return {
    setNumber: 1,
    repetitionNumber: nextNumber,
    distanceMetres: 0,
    timeSeconds: 0,
    notes: null,
  };
}

function confidenceLabel(value: number) {
  return ["Very low", "Low", "Neutral", "Good", "Very confident"][value - 1];
}

export function SessionCompletionForm({
  initialValue,
  submitLabel,
  cancelTo,
  onSubmit,
}: SessionCompletionFormProps) {
  const [values, setValues] = useState<FormValues>(
    initialValue ?? {
      actualIntensity: null,
      perceivedDifficulty: null,
      repetitionResults: [],
      reflection: emptyReflection,
    },
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateReflection<K extends keyof SessionReflection>(
    key: K,
    value: SessionReflection[K],
  ) {
    setValues((current) => ({
      ...current,
      reflection: { ...current.reflection, [key]: value },
    }));
  }

  function updateRepetition<K extends keyof RepetitionResult>(
    index: number,
    key: K,
    value: RepetitionResult[K],
  ) {
    setValues((current) => ({
      ...current,
      repetitionResults: current.repetitionResults.map((result, resultIndex) =>
        resultIndex === index ? { ...result, [key]: value } : result),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (
      values.actualIntensity === null
      || values.actualIntensity < 1
      || values.actualIntensity > 10
      || values.perceivedDifficulty === null
      || values.perceivedDifficulty < 1
      || values.perceivedDifficulty > 10
    ) {
      setError("Choose actual intensity and perceived difficulty from 1 to 10.");
      return;
    }
    if (
      (
        values.reflection.confidenceBefore !== null
        && (values.reflection.confidenceBefore < 1 || values.reflection.confidenceBefore > 5)
      )
      || (
        values.reflection.confidenceAfter !== null
        && (values.reflection.confidenceAfter < 1 || values.reflection.confidenceAfter > 5)
      )
    ) {
      setError("Confidence values must be from 1 to 5.");
      return;
    }
    if (values.repetitionResults.some((result) =>
      result.setNumber < 1
      || result.repetitionNumber < 1
      || result.distanceMetres <= 0
      || result.timeSeconds <= 0)) {
      setError("Each repetition needs positive set, rep, distance, and time values.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(values as SessionCompletionInput);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "The completed session could not be saved.",
      );
      setSubmitting(false);
    }
  }

  return (
    <form className="completion-form" onSubmit={handleSubmit} noValidate>
      {error && <p className="form-error" role="alert">{error}</p>}

      <section className="completion-form-section" aria-labelledby="ratings-heading">
        <div className="section-heading">
          <p className="step-number">01</p>
          <div>
            <h2 id="ratings-heading">Session ratings</h2>
            <p>Record how the completed work felt, independently of the original plan.</p>
          </div>
        </div>
        <div className="form-grid">
          <label className="field">
            <span>Actual intensity <span aria-hidden="true">*</span></span>
            <small>How hard did you actually run/work?</small>
            <select
              required
              value={values.actualIntensity ?? ""}
              onChange={(event) => setValues((current) => ({
                ...current,
                actualIntensity: event.target.value ? Number(event.target.value) : null,
              }))}
            >
              <option value="">Choose 1–10</option>
              {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Perceived difficulty <span aria-hidden="true">*</span></span>
            <small>How difficult did the session feel?</small>
            <select
              required
              value={values.perceivedDifficulty ?? ""}
              onChange={(event) => setValues((current) => ({
                ...current,
                perceivedDifficulty: event.target.value ? Number(event.target.value) : null,
              }))}
            >
              <option value="">Choose 1–10</option>
              {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="completion-form-section" aria-labelledby="repetitions-heading">
        <div className="section-heading">
          <p className="step-number">02</p>
          <div>
            <h2 id="repetitions-heading">Repetition results</h2>
            <p>Add timed repetitions when they are relevant. This section is optional.</p>
          </div>
        </div>
        <div className="repetition-list">
          {values.repetitionResults.map((result, index) => (
            <fieldset className="repetition-row" key={index}>
              <legend>Repetition {index + 1}</legend>
              <label className="field">
                <span>Set number</span>
                <input
                  aria-label={`Set number for repetition ${index + 1}`}
                  type="number"
                  min={1}
                  value={result.setNumber}
                  onChange={(event) => updateRepetition(index, "setNumber", Number(event.target.value))}
                />
              </label>
              <label className="field">
                <span>Rep number</span>
                <input
                  aria-label={`Rep number for repetition ${index + 1}`}
                  type="number"
                  min={1}
                  value={result.repetitionNumber}
                  onChange={(event) => updateRepetition(index, "repetitionNumber", Number(event.target.value))}
                />
              </label>
              <label className="field">
                <span>Distance (m)</span>
                <input
                  aria-label={`Distance for repetition ${index + 1}`}
                  type="number"
                  min="0.01"
                  step="any"
                  value={result.distanceMetres || ""}
                  onChange={(event) => updateRepetition(index, "distanceMetres", Number(event.target.value))}
                />
              </label>
              <label className="field">
                <span>Time (seconds)</span>
                <input
                  aria-label={`Time for repetition ${index + 1}`}
                  type="number"
                  min="0.01"
                  step="any"
                  value={result.timeSeconds || ""}
                  onChange={(event) => updateRepetition(index, "timeSeconds", Number(event.target.value))}
                />
              </label>
              <label className="field repetition-notes">
                <span>Notes</span>
                <input
                  aria-label={`Notes for repetition ${index + 1}`}
                  maxLength={500}
                  value={result.notes ?? ""}
                  onChange={(event) => updateRepetition(index, "notes", event.target.value || null)}
                />
              </label>
              <button
                className="button quiet-danger"
                type="button"
                onClick={() => setValues((current) => ({
                  ...current,
                  repetitionResults: current.repetitionResults.filter(
                    (_, resultIndex) => resultIndex !== index,
                  ),
                }))}
              >
                Remove repetition {index + 1}
              </button>
            </fieldset>
          ))}
        </div>
        <button
          className="button secondary"
          type="button"
          onClick={() => setValues((current) => ({
            ...current,
            repetitionResults: [
              ...current.repetitionResults,
              blankRepetition(current.repetitionResults.length + 1),
            ],
          }))}
        >
          Add repetition
        </button>
      </section>

      <section className="completion-form-section" aria-labelledby="reflection-heading">
        <div className="section-heading">
          <p className="step-number">03</p>
          <div>
            <h2 id="reflection-heading">Reflection</h2>
            <p>Capture useful evidence and a clear focus for the next session.</p>
          </div>
        </div>
        <div className="form-grid">
          {([
            ["wentWell", "What went well?"],
            ["improved", "What improved today?"],
            ["wasDifficult", "What felt difficult?"],
            ["nextFocus", "What do you want to focus on next time?"],
            ["coachFeedback", "Coach feedback"],
          ] as const).map(([key, label]) => (
            <label className={`field ${key === "coachFeedback" ? "field-wide" : ""}`} key={key}>
              <span>{label}</span>
              <textarea
                rows={3}
                maxLength={1000}
                value={values.reflection[key] ?? ""}
                onChange={(event) => updateReflection(key, event.target.value || null)}
              />
            </label>
          ))}
          {(["confidenceBefore", "confidenceAfter"] as const).map((key) => (
            <label className="field" key={key}>
              <span>
                {key === "confidenceBefore"
                  ? "Confidence before the session"
                  : "Confidence after the session"}
              </span>
              <select
                aria-label={key === "confidenceBefore"
                  ? "Confidence before the session"
                  : "Confidence after the session"}
                aria-describedby={`${key}-help`}
                value={values.reflection[key] ?? ""}
                onChange={(event) =>
                  updateReflection(key, event.target.value ? Number(event.target.value) : null)}
              >
                <option value="">Not provided</option>
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>{value} — {confidenceLabel(value)}</option>
                ))}
              </select>
              <small id={`${key}-help`}>
                {key === "confidenceBefore"
                  ? "How confident did you feel going into the session?"
                  : "How confident did you feel after completing it?"}
              </small>
            </label>
          ))}
        </div>
      </section>

      <div className="form-actions completion-actions">
        <button className="button primary" type="submit" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </button>
        <Link className="button secondary" to={cancelTo}>Cancel</Link>
      </div>
    </form>
  );
}
