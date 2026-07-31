import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../App";
import { SessionCompletionForm } from "../components/SessionCompletionForm";
import type { SessionCompletion } from "../types/sessionCompletion";
import type { Progress } from "../types/progress";
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
  getProgress: vi.fn(),
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

const lockedAchievement = {
  id: "reflective-start",
  name: "Reflective Start",
  description: "Reflect on your first completed session.",
  isUnlocked: false,
  currentProgress: 0,
  requiredProgress: 1,
};

const consistencyAchievement = {
  id: "consistent-work",
  name: "Consistent Work",
  description: "Complete five training sessions.",
  isUnlocked: false,
  currentProgress: 4,
  requiredProgress: 5,
};

function progress(
  totalXp: number,
  trackRank = 1,
  currentRankXp = totalXp,
  achievements = [lockedAchievement, consistencyAchievement],
): Progress {
  return {
    totalXp,
    trackRank,
    currentRankXp,
    xpPerRank: 100,
    completedSessions: 1,
    meaningfulReflections: 0,
    pairedConfidenceCheckIns: 0,
    achievements,
  };
}

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
    api.getProgress.mockResolvedValue(progress(65));
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
    expect(screen.getByText("How confident did you feel going into the session?")).toBeInTheDocument();
    expect(screen.getByText("How confident did you feel after completing it?")).toBeInTheDocument();
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
    expect(api.getProgress).toHaveBeenCalledTimes(2);
  });

  it("compares progress around a successful new completion and shows positive XP", async () => {
    const user = userEvent.setup();
    api.getSessionCompletion.mockRejectedValue(new MockApiError("Missing", 404));
    api.getProgress
      .mockResolvedValueOnce(progress(45))
      .mockResolvedValueOnce(progress(65));
    renderRoute(`/sessions/${session.id}/complete`);

    await user.selectOptions(await screen.findByLabelText(/Actual intensity/), "8");
    await user.selectOptions(screen.getByLabelText(/Perceived difficulty/), "7");
    await user.click(screen.getByRole("button", { name: "Log completed session" }));

    expect(await screen.findByRole("heading", { name: "Progress earned" })).toBeInTheDocument();
    expect(screen.getByText("+20 XP")).toBeInTheDocument();
    expect(api.createSessionCompletion).toHaveBeenCalledTimes(1);
    expect(api.getProgress).toHaveBeenCalledTimes(2);
  });

  it("captures progress before creating a completion to avoid racing XP feedback", async () => {
    const user = userEvent.setup();
    let resolvePreviousProgress!: (value: Progress) => void;
    const previousProgress = new Promise<Progress>((resolve) => {
      resolvePreviousProgress = resolve;
    });
    api.getSessionCompletion.mockRejectedValue(new MockApiError("Missing", 404));
    api.getProgress
      .mockReturnValueOnce(previousProgress)
      .mockResolvedValueOnce(progress(35));
    renderRoute(`/sessions/${session.id}/complete`);

    await user.selectOptions(await screen.findByLabelText(/Actual intensity/), "8");
    await user.selectOptions(screen.getByLabelText(/Perceived difficulty/), "7");
    await user.click(screen.getByRole("button", { name: "Log completed session" }));

    await waitFor(() => expect(api.getProgress).toHaveBeenCalledTimes(1));
    expect(api.createSessionCompletion).not.toHaveBeenCalled();

    resolvePreviousProgress(progress(0));

    expect(await screen.findByRole("heading", { name: "Progress earned" }))
      .toBeInTheDocument();
    expect(screen.getByText("+35 XP")).toBeInTheDocument();
  });

  it("shows an unchanged update without prominent +0 XP", async () => {
    const user = userEvent.setup();
    api.getProgress.mockResolvedValue(progress(65));
    renderRoute(`/sessions/${session.id}/complete`);

    await user.click(await screen.findByRole("button", { name: "Save completed session" }));

    expect(await screen.findByRole("heading", { name: "Session updated" })).toBeInTheDocument();
    expect(screen.getByText("Your progress total is unchanged.")).toBeInTheDocument();
    expect(screen.queryByText("+0 XP")).not.toBeInTheDocument();
  });

  it("presents a negative XP update neutrally", async () => {
    const user = userEvent.setup();
    api.getProgress
      .mockResolvedValueOnce(progress(65))
      .mockResolvedValueOnce(progress(55));
    renderRoute(`/sessions/${session.id}/complete`);

    await user.click(await screen.findByRole("button", { name: "Save completed session" }));

    expect(await screen.findByRole("heading", { name: "Progress updated" })).toBeInTheDocument();
    expect(screen.getByText("-10 XP")).toBeInTheDocument();
    expect(screen.queryByText(/lost|penalty|bad result/i)).not.toBeInTheDocument();
  });

  it("announces a TrackRank increase", async () => {
    const user = userEvent.setup();
    api.getProgress
      .mockResolvedValueOnce(progress(95, 1, 95))
      .mockResolvedValueOnce(progress(115, 2, 15));
    renderRoute(`/sessions/${session.id}/complete`);

    await user.click(await screen.findByRole("button", { name: "Save completed session" }));

    expect(await screen.findByRole("heading", { name: "TrackRank increased" })).toBeInTheDocument();
    expect(screen.getByText("TrackRank 2")).toBeInTheDocument();
  });

  it("shows an achievement that became unlocked", async () => {
    const user = userEvent.setup();
    const unlocked = { ...lockedAchievement, isUnlocked: true, currentProgress: 1 };
    api.getProgress
      .mockResolvedValueOnce(progress(65))
      .mockResolvedValueOnce(progress(75, 1, 75, [unlocked, consistencyAchievement]));
    renderRoute(`/sessions/${session.id}/complete`);

    await user.click(await screen.findByRole("button", { name: "Save completed session" }));

    expect(await screen.findByRole("heading", { name: "Achievement unlocked" })).toBeInTheDocument();
    expect(screen.getByText("Reflective Start")).toBeInTheDocument();
    expect(screen.getByText("Reflect on your first completed session.")).toBeInTheDocument();
  });

  it("does not show an achievement that was already unlocked", async () => {
    const user = userEvent.setup();
    const unlocked = { ...lockedAchievement, isUnlocked: true, currentProgress: 1 };
    api.getProgress
      .mockResolvedValueOnce(progress(65, 1, 65, [unlocked]))
      .mockResolvedValueOnce(progress(65, 1, 65, [unlocked]));
    renderRoute(`/sessions/${session.id}/complete`);

    await user.click(await screen.findByRole("button", { name: "Save completed session" }));

    await screen.findByRole("heading", { name: "Session updated" });
    expect(screen.queryByRole("heading", { name: /Achievements? unlocked/ })).not.toBeInTheDocument();
    expect(screen.queryByText("Reflective Start")).not.toBeInTheDocument();
  });

  it("shows multiple newly unlocked achievements", async () => {
    const user = userEvent.setup();
    const reflective = { ...lockedAchievement, isUnlocked: true, currentProgress: 1 };
    const consistent = { ...consistencyAchievement, isUnlocked: true, currentProgress: 5 };
    api.getProgress
      .mockResolvedValueOnce(progress(80))
      .mockResolvedValueOnce(progress(100, 2, 0, [reflective, consistent]));
    renderRoute(`/sessions/${session.id}/complete`);

    await user.click(await screen.findByRole("button", { name: "Save completed session" }));

    expect(await screen.findByRole("heading", { name: "Achievements unlocked" })).toBeInTheDocument();
    expect(screen.getByText("Reflective Start")).toBeInTheDocument();
    expect(screen.getByText("Consistent Work")).toBeInTheDocument();
  });

  it("does not block saving when pre-save progress fails", async () => {
    const user = userEvent.setup();
    api.getProgress
      .mockRejectedValueOnce(new Error("Unavailable"))
      .mockResolvedValueOnce(progress(65));
    renderRoute(`/sessions/${session.id}/complete`);

    await user.click(await screen.findByRole("button", { name: "Save completed session" }));

    expect(api.updateSessionCompletion).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole("heading", { name: "Session saved" })).toBeInTheDocument();
    expect(screen.getByText("TrackRank 1")).toBeInTheDocument();
  });

  it("reports a successful save when post-save progress fails", async () => {
    const user = userEvent.setup();
    api.getProgress
      .mockResolvedValueOnce(progress(65))
      .mockRejectedValueOnce(new Error("Unavailable"));
    renderRoute(`/sessions/${session.id}/complete`);

    await user.click(await screen.findByRole("button", { name: "Save completed session" }));

    expect(api.updateSessionCompletion).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole("heading", { name: "Session saved" })).toBeInTheDocument();
    expect(screen.getByText("Progress information is temporarily unavailable.")).toBeInTheDocument();
  });

  it("does not fabricate an XP delta without previous progress", async () => {
    const user = userEvent.setup();
    api.getProgress
      .mockRejectedValueOnce(new Error("Unavailable"))
      .mockResolvedValueOnce(progress(100, 2, 0));
    renderRoute(`/sessions/${session.id}/complete`);

    await user.click(await screen.findByRole("button", { name: "Save completed session" }));

    await screen.findByRole("heading", { name: "Session saved" });
    expect(screen.getByText(/previous total was unavailable/)).toBeInTheDocument();
    expect(screen.queryByText(/\+\d+ XP/)).not.toBeInTheDocument();
  });

  it("links progress feedback to the Progress page", async () => {
    const user = userEvent.setup();
    api.getProgress
      .mockResolvedValueOnce(progress(45))
      .mockResolvedValueOnce(progress(65));
    renderRoute(`/sessions/${session.id}/complete`);

    await user.click(await screen.findByRole("button", { name: "Save completed session" }));

    expect(await screen.findByRole("link", { name: "View progress" })).toHaveAttribute(
      "href",
      "/progress",
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
