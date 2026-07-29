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

  it("shows the essential fields first on the create form", () => {
    renderRoute("/sessions/new");

    expect(screen.getByLabelText(/Session type/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/)).toBeRequired();
    expect(screen.getByLabelText(/What's the session/)).toBeRequired();
    expect(screen.getByLabelText(/Planned intensity/)).toBeRequired();
    expect(screen.getByRole("button", { name: "Create session" })).toBeInTheDocument();
  });

  it("keeps optional clarity collapsed by default", () => {
    renderRoute("/sessions/new");

    expect(screen.getByRole("button", { name: /Add more clarity/ })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByLabelText("Purpose")).not.toBeInTheDocument();
  });

  it("exposes optional fields through Add more clarity", async () => {
    const user = userEvent.setup();
    renderRoute("/sessions/new");

    await user.click(screen.getByRole("button", { name: /Add more clarity/ }));

    expect(screen.getByLabelText("Purpose")).toBeInTheDocument();
    expect(screen.getByLabelText("Focus cue")).toBeInTheDocument();
    expect(screen.getByLabelText("Success criteria")).toBeInTheDocument();
    expect(screen.getByLabelText("Coach notes")).toBeInTheDocument();
  });

  it("submits a session without optional clarity", async () => {
    const user = userEvent.setup();
    renderRoute("/sessions/new");

    await user.type(screen.getByLabelText(/Date/), "2026-08-01");
    await user.type(screen.getByLabelText(/What's the session/), "3 x 150m @ 90%");
    await user.type(screen.getByLabelText(/Planned intensity/), "90");
    await user.click(screen.getByRole("button", { name: "Create session" }));

    await waitFor(() => expect(api.createTrainingSession).toHaveBeenCalledTimes(1));
    expect(api.createTrainingSession).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "",
        prescription: "3 x 150m @ 90%",
        intendedIntensity: 90,
        purpose: null,
        focusCue: null,
        successCriteria: null,
        status: "Planned",
      }),
    );
  });

  it("fills empty fields with suggested clarity", async () => {
    const user = userEvent.setup();
    renderRoute("/sessions/new");

    await user.click(screen.getByRole("button", { name: /Add more clarity/ }));
    await user.click(
      screen.getByRole("button", { name: "Use suggested clarity for Acceleration" }),
    );

    expect(screen.getByLabelText("Purpose")).toHaveValue(
      "Improve the first phase of the sprint and build speed efficiently.",
    );
    expect(screen.getByLabelText("Focus cue")).not.toHaveValue("");
    expect(screen.getByLabelText("Success criteria")).not.toHaveValue("");
    expect(screen.getByLabelText("Coach notes")).toHaveValue("");
  });

  it("does not overwrite athlete-entered clarity", async () => {
    const user = userEvent.setup();
    renderRoute("/sessions/new");

    await user.click(screen.getByRole("button", { name: /Add more clarity/ }));
    await user.type(screen.getByLabelText("Purpose"), "My coach's purpose");
    await user.click(
      screen.getByRole("button", { name: "Use suggested clarity for Acceleration" }),
    );

    expect(screen.getByLabelText("Purpose")).toHaveValue("My coach's purpose");
    expect(screen.getByLabelText("Focus cue")).not.toHaveValue("");
  });

  it("does not replace clarity when session type changes", async () => {
    const user = userEvent.setup();
    renderRoute("/sessions/new");

    await user.click(screen.getByRole("button", { name: /Add more clarity/ }));
    await user.click(
      screen.getByRole("button", { name: "Use suggested clarity for Acceleration" }),
    );
    const accelerationPurpose = screen.getByLabelText("Purpose").getAttribute("value")
      ?? (screen.getByLabelText("Purpose") as HTMLTextAreaElement).value;
    await user.selectOptions(screen.getByLabelText(/Session type/), "MaxVelocity");

    expect(screen.getByLabelText("Purpose")).toHaveValue(accelerationPurpose);
  });

  it("opens clarity in edit mode when existing values are present", async () => {
    renderRoute(`/sessions/${session.id}/edit`);

    expect(await screen.findByLabelText("Purpose")).toHaveValue(session.purpose);
    expect(screen.getByRole("button", { name: /Add more clarity/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("submits an optional custom title", async () => {
    const user = userEvent.setup();
    renderRoute("/sessions/new");

    await user.type(screen.getByLabelText(/Date/), "2026-08-01");
    await user.type(screen.getByLabelText(/What's the session/), "4 x 30m");
    await user.type(screen.getByLabelText(/Planned intensity/), "95");
    await user.type(screen.getByLabelText(/Custom title/), "Block start sharpness");
    await user.click(screen.getByRole("button", { name: "Create session" }));

    await waitFor(() => expect(api.createTrainingSession).toHaveBeenCalled());
    expect(api.createTrainingSession).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Block start sharpness" }),
    );
  });

  it("continues to update an existing session", async () => {
    const user = userEvent.setup();
    renderRoute(`/sessions/${session.id}/edit`);

    const prescription = await screen.findByLabelText(/What's the session/);
    await user.clear(prescription);
    await user.type(prescription, "4 x 120m");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(api.updateTrainingSession).toHaveBeenCalled());
    expect(api.updateTrainingSession).toHaveBeenCalledWith(
      session.id,
      expect.objectContaining({ prescription: "4 x 120m" }),
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
