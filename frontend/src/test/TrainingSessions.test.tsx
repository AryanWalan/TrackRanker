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

const completedSource: TrainingSession = {
  ...session,
  title: "Completed speed endurance",
  coachNotes: "Stay patient between repetitions.",
  status: "Completed",
};

function todayLocalDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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

  it("offers a Repeat session action for the current session", async () => {
    renderRoute(`/sessions/${session.id}`);

    expect(await screen.findByRole("link", { name: "Repeat session" })).toHaveAttribute(
      "href",
      `/sessions/new?copy=${session.id}`,
    );
  });

  it("loads a previous session before showing the repeat form", async () => {
    let resolveSource: ((value: TrainingSession) => void) | undefined;
    api.getTrainingSession.mockReturnValue(
      new Promise<TrainingSession>((resolve) => {
        resolveSource = resolve;
      }),
    );
    renderRoute(`/sessions/new?copy=${session.id}`);

    expect(screen.getByRole("status")).toHaveTextContent("Loading previous session");
    expect(screen.queryByRole("button", { name: "Create session" })).not.toBeInTheDocument();

    resolveSource?.(completedSource);
    expect(await screen.findByRole("button", { name: "Create session" })).toBeInTheDocument();
  });

  it("prefills only planned-session fields for a repeated session", async () => {
    api.getTrainingSession.mockResolvedValue(completedSource);
    renderRoute(`/sessions/new?copy=${session.id}`);

    expect(await screen.findByText(/Starting from a previous session/)).toHaveTextContent(
      completedSource.title,
    );
    expect(screen.getByLabelText(/Session type/)).toHaveValue(completedSource.sessionType);
    expect(screen.getByLabelText(/What's the session/)).toHaveValue(
      completedSource.prescription,
    );
    expect(screen.getByLabelText(/Planned intensity/)).toHaveValue(
      completedSource.intendedIntensity,
    );
    expect(screen.getByLabelText(/Date/)).toHaveValue(todayLocalDate());
    expect(screen.getByLabelText("Status")).toHaveValue("Planned");
    expect(screen.getByLabelText(/Custom title/)).toHaveValue("");

    expect(screen.getByRole("button", { name: /Add more clarity/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByLabelText("Purpose")).toHaveValue(completedSource.purpose);
    expect(screen.getByLabelText("Focus cue")).toHaveValue(completedSource.focusCue);
    expect(screen.getByLabelText("Success criteria")).toHaveValue(
      completedSource.successCriteria,
    );
    expect(screen.getByLabelText("Coach notes")).toHaveValue(completedSource.coachNotes);
    expect(api.getSessionCompletion).not.toHaveBeenCalled();
  });

  it("allows prefilled values to be edited and uses the normal create API", async () => {
    const user = userEvent.setup();
    api.getTrainingSession.mockResolvedValue(completedSource);
    renderRoute(`/sessions/new?copy=${session.id}`);

    const prescription = await screen.findByLabelText(/What's the session/);
    await user.clear(prescription);
    await user.type(prescription, "4 x 120m @ 88%");
    await user.clear(screen.getByLabelText("Purpose"));
    await user.type(screen.getByLabelText("Purpose"), "Build repeatable rhythm.");
    await user.click(screen.getByRole("button", { name: "Create session" }));

    await waitFor(() => expect(api.createTrainingSession).toHaveBeenCalledTimes(1));
    expect(api.createTrainingSession).toHaveBeenCalledWith({
      title: "",
      sessionType: completedSource.sessionType,
      sessionDate: todayLocalDate(),
      prescription: "4 x 120m @ 88%",
      purpose: "Build repeatable rhythm.",
      focusCue: completedSource.focusCue,
      successCriteria: completedSource.successCriteria,
      intendedIntensity: completedSource.intendedIntensity,
      coachNotes: completedSource.coachNotes,
      status: "Planned",
    });
    const submitted = api.createTrainingSession.mock.calls[0][0];
    expect(submitted).not.toHaveProperty("id");
    expect(submitted).not.toHaveProperty("completion");
    expect(submitted).not.toHaveProperty("reflection");
  });

  it("allows blank creation when the source session cannot be loaded", async () => {
    const user = userEvent.setup();
    api.getTrainingSession.mockRejectedValue(new Error("Missing"));
    renderRoute("/sessions/new?copy=not-a-valid-id");

    expect(
      await screen.findByRole("heading", { name: "That session couldn't be loaded." }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Create a blank session" }));

    expect(screen.getByRole("button", { name: "Create session" })).toBeInTheDocument();
    expect(screen.getByLabelText(/What's the session/)).toHaveValue("");
    expect(screen.getByLabelText(/Date/)).toHaveValue("");
    expect(screen.getByLabelText("Status")).toHaveValue("Planned");
  });

  it("does not load a source for normal session creation", () => {
    renderRoute("/sessions/new");

    expect(api.getTrainingSession).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Create session" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/)).toHaveValue("");
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
