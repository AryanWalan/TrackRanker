import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../App";
import { SessionCompletionForm } from "../components/SessionCompletionForm";
import type { SessionCompletion } from "../types/sessionCompletion";
import type { TrainingSession } from "../types/trainingSession";

const MockApiError = vi.hoisted(() =>
  class MockApiError extends Error {
    constructor(message: string, public readonly status: number) {
      super(message);
    }
  });

const api = vi.hoisted(() => ({
  getTrainingSessions: vi.fn(),
  getTrainingSession: vi.fn(),
  createTrainingSession: vi.fn(),
  updateTrainingSession: vi.fn(),
  deleteTrainingSession: vi.fn(),
  getSessionCompletion: vi.fn(),
  createSessionCompletion: vi.fn(),
  updateSessionCompletion: vi.fn(),
  deleteSessionCompletion: vi.fn(),
}));

vi.mock("../services/trainingSessions", () => ({
  ...api,
  ApiError: MockApiError,
}));

const session: TrainingSession = {
  id: "507f1f77bcf86cd799439011",
  title: "Speed endurance",
  sessionType: "SpeedEndurance",
  sessionDate: "2026-08-01",
  prescription: "3 x 150m @ 90%",
  purpose: "Develop speed endurance.",
  focusCue: "Stay relaxed.",
  successCriteria: "Consistent mechanics.",
  intendedIntensity: 90,
  coachNotes: null,
  status: "Completed",
  createdAtUtc: "2026-07-29T00:00:00Z",
  updatedAtUtc: "2026-07-29T01:00:00Z",
};

const completion: SessionCompletion = {
  id: "507f191e810c19729de860ea",
  trainingSessionId: session.id,
  completedAtUtc: "2026-08-01T03:30:00Z",
  actualIntensity: 8,
  perceivedDifficulty: 7,
  repetitionResults: [
    {
      setNumber: 1,
      repetitionNumber: 1,
      distanceMetres: 150,
      timeSeconds: 17.4,
      notes: "Relaxed finish.",
    },
  ],
  reflection: {
    wentWell: "Held rhythm through the final 50m.",
    improved: "Stayed relaxed.",
    wasDifficult: "The final repetition.",
    nextFocus: "Keep the first 50m patient.",
    coachFeedback: "Maintain posture.",
    confidenceBefore: 3,
    confidenceAfter: 4,
  },
  createdAtUtc: "2026-08-01T03:30:00Z",
  updatedAtUtc: "2026-08-01T03:30:00Z",
};

function renderRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("session completion and reflection", () => {
  beforeEach(() => {
    api.getTrainingSession.mockResolvedValue(session);
    api.getSessionCompletion.mockResolvedValue(completion);
    api.createSessionCompletion.mockResolvedValue(completion);
    api.updateSessionCompletion.mockResolvedValue(completion);
    api.deleteSessionCompletion.mockResolvedValue(undefined);
    api.getTrainingSessions.mockResolvedValue([]);
  });

  it("shows an empty completion state on session details", async () => {
    api.getSessionCompletion.mockRejectedValue(new MockApiError("Missing", 404));
    renderRoute(`/sessions/${session.id}`);

    expect(await screen.findByText(/haven't logged the outcome/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log completed session" })).toBeInTheDocument();
  });

  it("renders existing completed-session information", async () => {
    renderRoute(`/sessions/${session.id}`);

    expect(await screen.findByText("8/10")).toBeInTheDocument();
    expect(screen.getByText("Held rhythm through the final 50m.")).toBeInTheDocument();
    expect(screen.getByText("4 — Good")).toBeInTheDocument();
  });

  it("renders the reflection prompts", async () => {
    api.getSessionCompletion.mockRejectedValue(new MockApiError("Missing", 404));
    renderRoute(`/sessions/${session.id}/complete`);

    expect(await screen.findByLabelText("What went well?")).toBeInTheDocument();
    expect(screen.getByLabelText("What improved today?")).toBeInTheDocument();
    expect(screen.getByLabelText("What felt difficult?")).toBeInTheDocument();
    expect(screen.getByLabelText("What do you want to focus on next time?")).toBeInTheDocument();
  });

  it("validates the required ratings", async () => {
    const user = userEvent.setup();
    api.getSessionCompletion.mockRejectedValue(new MockApiError("Missing", 404));
    renderRoute(`/sessions/${session.id}/complete`);

    await user.click(await screen.findByRole("button", { name: "Log completed session" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Choose actual intensity and perceived difficulty from 1 to 10.",
    );
    expect(api.createSessionCompletion).not.toHaveBeenCalled();
  });

  it("does not submit confidence outside the valid range", async () => {
    const submit = vi.fn();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SessionCompletionForm
          submitLabel="Save"
          cancelTo="/sessions"
          initialValue={{
            actualIntensity: 8,
            perceivedDifficulty: 7,
            repetitionResults: [],
            reflection: { ...completion.reflection, confidenceBefore: 6 },
          }}
          onSubmit={submit}
        />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Confidence values must be from 1 to 5.");
    expect(submit).not.toHaveBeenCalled();
  });

  it("adds a repetition row", async () => {
    const user = userEvent.setup();
    api.getSessionCompletion.mockRejectedValue(new MockApiError("Missing", 404));
    renderRoute(`/sessions/${session.id}/complete`);

    await user.click(await screen.findByRole("button", { name: "Add repetition" }));

    expect(screen.getByRole("group", { name: "Repetition 1" })).toBeInTheDocument();
  });

  it("removes a repetition row", async () => {
    const user = userEvent.setup();
    renderRoute(`/sessions/${session.id}/complete`);

    await user.click(await screen.findByRole("button", { name: "Remove repetition 1" }));

    expect(screen.queryByRole("group", { name: "Repetition 1" })).not.toBeInTheDocument();
  });

  it("submits a valid completion payload", async () => {
    const user = userEvent.setup();
    api.getSessionCompletion.mockRejectedValue(new MockApiError("Missing", 404));
    renderRoute(`/sessions/${session.id}/complete`);

    await user.selectOptions(await screen.findByLabelText(/Actual intensity/), "8");
    await user.selectOptions(screen.getByLabelText(/Perceived difficulty/), "7");
    await user.type(screen.getByLabelText("What went well?"), "Strong rhythm.");
    await user.selectOptions(screen.getByLabelText("Confidence after the session"), "4");
    await user.click(screen.getByRole("button", { name: "Log completed session" }));

    await waitFor(() => expect(api.createSessionCompletion).toHaveBeenCalledTimes(1));
    expect(api.createSessionCompletion).toHaveBeenCalledWith(
      session.id,
      expect.objectContaining({
        actualIntensity: 8,
        perceivedDifficulty: 7,
        reflection: expect.objectContaining({
          wentWell: "Strong rhythm.",
          confidenceAfter: 4,
        }),
      }),
    );
  });

  it("populates existing completion data in edit mode", async () => {
    renderRoute(`/sessions/${session.id}/complete`);

    expect(await screen.findByRole("heading", { name: "Edit completed session" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Actual intensity/)).toHaveValue("8");
    expect(screen.getByLabelText("What went well?")).toHaveValue(
      "Held rhythm through the final 50m.",
    );
  });

  it("requires confirmation before deleting a completion", async () => {
    const user = userEvent.setup();
    renderRoute(`/sessions/${session.id}`);

    await user.click(await screen.findByRole("button", { name: "Delete completed session" }));
    expect(api.deleteSessionCompletion).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Confirm completion deletion" }));
    await waitFor(() =>
      expect(api.deleteSessionCompletion).toHaveBeenCalledWith(session.id),
    );
  });
});
