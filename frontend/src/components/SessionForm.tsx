import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import {
  sessionStatuses,
  sessionTypes,
  type TrainingSessionInput,
} from "../types/trainingSession";

interface SessionFormProps {
  initialValue?: TrainingSessionInput;
  submitLabel: string;
  cancelTo: string;
  onSubmit: (input: TrainingSessionInput) => Promise<void>;
}

const emptySession: TrainingSessionInput = {
  title: "",
  sessionType: "Acceleration",
  sessionDate: "",
  prescription: "",
  purpose: null,
  focusCue: null,
  successCriteria: null,
  intendedIntensity: null,
  coachNotes: null,
  status: "Planned",
};

function displayType(value: string) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export function SessionForm({
  initialValue = emptySession,
  submitLabel,
  cancelTo,
  onSubmit,
}: SessionFormProps) {
  const [values, setValues] = useState<TrainingSessionInput>(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof TrainingSessionInput>(
    key: K,
    value: TrainingSessionInput[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!values.title.trim() || !values.sessionDate || !values.prescription.trim()) {
      setError("Complete the required title, date, and prescription fields.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...values,
        title: values.title.trim(),
        prescription: values.prescription.trim(),
      });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "The session could not be saved.",
      );
      setSubmitting(false);
    }
  }

  return (
    <form className="session-form" onSubmit={handleSubmit}>
      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-grid">
        <label className="field field-wide">
          <span>Title <span aria-hidden="true">*</span></span>
          <input
            required
            maxLength={100}
            value={values.title}
            onChange={(event) => update("title", event.target.value)}
          />
        </label>

        <label className="field">
          <span>Session Type <span aria-hidden="true">*</span></span>
          <select
            value={values.sessionType}
            onChange={(event) =>
              update("sessionType", event.target.value as TrainingSessionInput["sessionType"])}
          >
            {sessionTypes.map((type) => (
              <option key={type} value={type}>{displayType(type)}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Date <span aria-hidden="true">*</span></span>
          <input
            type="date"
            required
            value={values.sessionDate}
            onChange={(event) => update("sessionDate", event.target.value)}
          />
        </label>

        <label className="field field-wide">
          <span>Prescription <span aria-hidden="true">*</span></span>
          <textarea
            required
            maxLength={1000}
            rows={4}
            value={values.prescription}
            onChange={(event) => update("prescription", event.target.value)}
          />
          <small>Describe the repetitions, distances, recovery, and sets.</small>
        </label>

        <label className="field field-wide">
          <span>Purpose</span>
          <textarea
            maxLength={1000}
            rows={3}
            value={values.purpose ?? ""}
            onChange={(event) => update("purpose", event.target.value || null)}
          />
        </label>

        <label className="field">
          <span>Focus Cue</span>
          <textarea
            maxLength={500}
            rows={3}
            value={values.focusCue ?? ""}
            onChange={(event) => update("focusCue", event.target.value || null)}
          />
        </label>

        <label className="field">
          <span>Success Criteria</span>
          <textarea
            maxLength={500}
            rows={3}
            value={values.successCriteria ?? ""}
            onChange={(event) => update("successCriteria", event.target.value || null)}
          />
        </label>

        <label className="field">
          <span>Intended Intensity (%)</span>
          <input
            type="number"
            min={0}
            max={100}
            value={values.intendedIntensity ?? ""}
            onChange={(event) =>
              update(
                "intendedIntensity",
                event.target.value === "" ? null : Number(event.target.value),
              )}
          />
        </label>

        <label className="field">
          <span>Status</span>
          <select
            value={values.status}
            onChange={(event) =>
              update("status", event.target.value as TrainingSessionInput["status"])}
          >
            {sessionStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>

        <label className="field field-wide">
          <span>Coach Notes</span>
          <textarea
            maxLength={1000}
            rows={3}
            value={values.coachNotes ?? ""}
            onChange={(event) => update("coachNotes", event.target.value || null)}
          />
        </label>
      </div>

      <p className="required-note"><span aria-hidden="true">*</span> Required fields</p>
      <div className="form-actions">
        <button className="button primary" type="submit" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </button>
        <Link className="button secondary" to={cancelTo}>Cancel</Link>
      </div>
    </form>
  );
}
