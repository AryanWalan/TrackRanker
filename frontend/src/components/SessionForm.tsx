import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { sessionClarityPresets } from "../config/sessionClarityPresets";
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
  onChange?: (input: TrainingSessionInput) => void;
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

function hasClarity(value: TrainingSessionInput) {
  return Boolean(
    value.purpose
    || value.focusCue
    || value.successCriteria
    || value.coachNotes,
  );
}

export function SessionForm({
  initialValue = emptySession,
  submitLabel,
  cancelTo,
  onSubmit,
  onChange,
}: SessionFormProps) {
  const [values, setValues] = useState<TrainingSessionInput>(initialValue);
  const [clarityExpanded, setClarityExpanded] = useState(
    hasClarity(initialValue),
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof TrainingSessionInput>(
    key: K,
    value: TrainingSessionInput[K],
  ) {
    const next = { ...values, [key]: value };
    setValues(next);
    onChange?.(next);
  }

  function useSuggestedClarity() {
    const preset = sessionClarityPresets[values.sessionType];
    if (!preset) return;

    const next = {
      ...values,
      purpose: values.purpose?.trim() ? values.purpose : preset.purpose,
      focusCue: values.focusCue?.trim() ? values.focusCue : preset.focusCue,
      successCriteria: values.successCriteria?.trim()
        ? values.successCriteria
        : preset.successCriteria,
    };
    setValues(next);
    onChange?.(next);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (
      !values.sessionDate
      || !values.prescription.trim()
      || values.intendedIntensity === null
      || values.intendedIntensity < 0
      || values.intendedIntensity > 100
    ) {
      setError(
        "Add the session date, prescription, and planned intensity from 0 to 100.",
      );
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

  const preset = sessionClarityPresets[values.sessionType];
  const submittingLabel = submitLabel === "Create session"
    ? "Creating..."
    : "Saving...";

  return (
    <form className="session-form streamlined-session-form" onSubmit={handleSubmit} noValidate>
      {error && <p className="form-error" id="session-form-error" role="alert">{error}</p>}

      <section className="session-form-section" aria-labelledby="essentials-heading">
        <div className="compact-section-heading">
          <p className="eyebrow">Essentials</p>
          <h2 id="essentials-heading">Log the workout</h2>
        </div>

        <div className="form-grid essentials-grid">
          <label className="field">
            <span>Session type <span aria-hidden="true">*</span></span>
            <select
              value={values.sessionType}
              onChange={(event) =>
                update(
                  "sessionType",
                  event.target.value as TrainingSessionInput["sessionType"],
                )}
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
              aria-describedby={error ? "session-form-error" : undefined}
              value={values.sessionDate}
              onChange={(event) => update("sessionDate", event.target.value)}
            />
          </label>

          <label className="field field-wide prescription-field">
            <span>What's the session? <span aria-hidden="true">*</span></span>
            <textarea
              required
              maxLength={1000}
              rows={3}
              placeholder="3 × 150m, 10 min rest"
              aria-describedby="prescription-help"
              value={values.prescription}
              onChange={(event) => update("prescription", event.target.value)}
            />
            <small id="prescription-help">
              Add the reps, distance, sets, and rest your coach prescribed.
            </small>
          </label>

          <label className="field">
            <span>Planned intensity <span aria-hidden="true">*</span></span>
            <div className="input-with-suffix">
              <input
                type="number"
                min={0}
                max={100}
                required
                aria-describedby="intensity-help"
                value={values.intendedIntensity ?? ""}
                onChange={(event) =>
                  update(
                    "intendedIntensity",
                    event.target.value === "" ? null : Number(event.target.value),
                  )}
              />
              <span aria-hidden="true">%</span>
            </div>
            <small id="intensity-help">Planned percentage effort, from 0 to 100.</small>
          </label>

          <label className="field">
            <span>Status</span>
            <select
              value={values.status}
              onChange={(event) =>
                update(
                  "status",
                  event.target.value as TrainingSessionInput["status"],
                )}
            >
              {sessionStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>

          <label className="field field-wide custom-title-field">
            <span>Custom title <span className="optional-label">Optional</span></span>
            <input
              maxLength={100}
              placeholder={`${displayType(values.sessionType)} — ${values.prescription || "workout"}`}
              value={values.title}
              onChange={(event) => update("title", event.target.value)}
            />
            <small>Leave blank and TrackRanker will create a title from the workout.</small>
          </label>
        </div>
      </section>

      <section className="clarity-disclosure">
        <button
          className="clarity-toggle"
          type="button"
          aria-expanded={clarityExpanded}
          aria-controls="session-clarity-fields"
          onClick={() => setClarityExpanded((expanded) => !expanded)}
        >
          <span>
            <strong>Add more clarity</strong>
            <small>Purpose, focus, success criteria, and coach notes</small>
          </span>
          <span aria-hidden="true">{clarityExpanded ? "−" : "+"}</span>
        </button>

        {clarityExpanded && (
          <div id="session-clarity-fields" className="clarity-fields">
            <div className="clarity-preset-row">
              <div>
                <h2>Optional session clarity</h2>
                <p>Use a TrackRanker template as an editable starting point.</p>
              </div>
              {preset && (
                <button
                  className="button secondary"
                  type="button"
                  onClick={useSuggestedClarity}
                >
                  Use suggested clarity for {displayType(values.sessionType)}
                </button>
              )}
            </div>

            <div className="form-grid">
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
                <span>Focus cue</span>
                <textarea
                  maxLength={500}
                  rows={3}
                  value={values.focusCue ?? ""}
                  onChange={(event) => update("focusCue", event.target.value || null)}
                />
              </label>

              <label className="field">
                <span>Success criteria</span>
                <textarea
                  maxLength={500}
                  rows={3}
                  value={values.successCriteria ?? ""}
                  onChange={(event) =>
                    update("successCriteria", event.target.value || null)}
                />
              </label>

              <label className="field field-wide">
                <span>Coach notes</span>
                <textarea
                  maxLength={1000}
                  rows={3}
                  value={values.coachNotes ?? ""}
                  onChange={(event) => update("coachNotes", event.target.value || null)}
                />
              </label>
            </div>
          </div>
        )}
      </section>

      <p className="required-note"><span aria-hidden="true">*</span> Required fields</p>
      <div className="form-actions">
        <button className="button primary" type="submit" disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </button>
        <Link className="button secondary" to={cancelTo}>Cancel</Link>
      </div>
    </form>
  );
}
