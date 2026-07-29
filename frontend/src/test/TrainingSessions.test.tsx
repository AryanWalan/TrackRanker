import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../App";
import type { TrainingSession } from "../types/trainingSession";

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
  ApiError: class ApiError extends Error {},
}));

const session: TrainingSession = {
  id: "507f1f77bcf86cd799439011",
  title: "Speed endurance",
  sessionType: "SpeedEndurance",
  sessionDate: "2026-08-01",
  prescription: "3 x 150m @ 90%",
  purpose: "Develop speed endurance while maintaining relaxed mechanics.",
  focusCue: "Stay relaxed through the shoulders.",
  successCriteria: "Keep mechanics consistent across all repetitions.",
  intendedIntensity: 90,
  coachNotes: null,
  status: "Planned",
  createdAtUtc: "2026-07-29T00:00:00Z",
  updatedAtUtc: "2026-07-29T00:00:00Z",
};

function renderRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("training sessions", () => {
  beforeEach(() => {
    api.getTrainingSessions.mockResolvedValue([]);
    api.getTrainingSession.mockResolvedValue(session);
    api.createTrainingSession.mockResolvedValue(session);
    api.updateTrainingSession.mockResolvedValue(session);
    api.deleteTrainingSession.mockResolvedValue(undefined);
    api.getSessionCompletion.mockRejectedValue(new Error("No completion"));
  });

  it("renders sessions returned by the API", async () => {
    api.getTrainingSessions.mockResolvedValue([session]);
    renderRoute("/sessions");

    expect(await screen.findByRole("heading", { name: "Speed endurance" })).toBeInTheDocument();
    expect(screen.getByText("3 x 150m @ 90%")).toBeInTheDocument();
    expect(screen.getByText("Intended intensity", { exact: false })).toHaveTextContent("90%");
  });

  it("renders the empty state", async () => {
    api.getTrainingSessions.mockResolvedValue([]);
    renderRoute("/sessions");

    expect(await screen.findByRole("heading", { name: "No sessions yet." })).toBeInTheDocument();
    expect(screen.getByText(/Add your first training session/)).toBeInTheDocument();
  });

  it("renders required fields on the create form", () => {
    renderRoute("/sessions/new");

    expect(screen.getByLabelText(/Title/)).toBeRequired();
    expect(screen.getByLabelText(/Date/)).toBeRequired();
    expect(screen.getByLabelText(/Prescription/)).toBeRequired();
    expect(screen.getByRole("button", { name: "Create Session" })).toBeInTheDocument();
  });

  it("submits a valid create form through the API", async () => {
    const user = userEvent.setup();
    renderRoute("/sessions/new");

    await user.type(screen.getByLabelText(/Title/), "Speed endurance");
    await user.type(screen.getByLabelText(/Date/), "2026-08-01");
    await user.type(screen.getByLabelText(/Prescription/), "3 x 150m @ 90%");
    await user.click(screen.getByRole("button", { name: "Create Session" }));

    await waitFor(() => expect(api.createTrainingSession).toHaveBeenCalledTimes(1));
    expect(api.createTrainingSession).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Speed endurance",
        prescription: "3 x 150m @ 90%",
        status: "Planned",
      }),
    );
  });

  it("displays purpose and focus on the detail page", async () => {
    renderRoute(`/sessions/${session.id}`);

    expect(await screen.findByText(session.purpose!)).toBeInTheDocument();
    expect(screen.getByText(session.focusCue!)).toBeInTheDocument();
  });

  it("requires confirmation before deleting", async () => {
    const user = userEvent.setup();
    renderRoute(`/sessions/${session.id}`);

    await user.click(await screen.findByRole("button", { name: "Delete Session" }));
    expect(api.deleteTrainingSession).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Confirm Delete" }));
    await waitFor(() =>
      expect(api.deleteTrainingSession).toHaveBeenCalledWith(session.id),
    );
  });
});
