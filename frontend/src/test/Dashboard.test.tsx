import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../App";
import type { TrainingSession } from "../types/trainingSession";

const api = vi.hoisted(() => ({
  getTrainingSessions: vi.fn(),
}));

vi.mock("../services/trainingSessions", () => ({
  ...api,
  ApiError: class ApiError extends Error {},
}));

const sessions: TrainingSession[] = [
  createSession("older", "Older tempo", "2026-07-01", "Tempo"),
  createSession("newest", "Newest starts", "2026-07-10", "Starts"),
  createSession("second", "Second acceleration", "2026-07-09", "Acceleration"),
  createSession("third", "Third speed work", "2026-07-08", "MaxVelocity"),
];

function createSession(
  id: string,
  title: string,
  sessionDate: string,
  sessionType: TrainingSession["sessionType"],
): TrainingSession {
  return {
    id,
    title,
    sessionType,
    sessionDate,
    prescription: `${title} prescription`,
    purpose: null,
    focusCue: null,
    successCriteria: null,
    intendedIntensity: 90,
    coachNotes: null,
    status: "Planned",
    createdAtUtc: `${sessionDate}T00:00:00Z`,
    updatedAtUtc: `${sessionDate}T00:00:00Z`,
  };
}

function renderDashboard() {
  vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>,
  );
}

describe("Dashboard", () => {
  beforeEach(() => {
    api.getTrainingSessions.mockResolvedValue(sessions);
  });

  it("renders the TrackRanker title and tagline", () => {
    api.getTrainingSessions.mockImplementation(() => new Promise(() => {}));
    renderDashboard();
    expect(screen.getByRole("heading", { name: "TrackRanker" })).toBeInTheDocument();
    expect(screen.getByText("Understand your training. Trust your progress.")).toBeInTheDocument();
  });

  it("links Log a session to session creation", () => {
    api.getTrainingSessions.mockImplementation(() => new Promise(() => {}));
    renderDashboard();
    expect(screen.getByRole("link", { name: /Log a session/ })).toHaveAttribute(
      "href",
      "/sessions/new",
    );
  });

  it("links View training to the sessions list", () => {
    api.getTrainingSessions.mockImplementation(() => new Promise(() => {}));
    renderDashboard();
    expect(screen.getByRole("link", { name: /View training/ })).toHaveAttribute(
      "href",
      "/sessions",
    );
  });

  it("renders recent sessions returned by the API", async () => {
    renderDashboard();
    expect(await screen.findByText("Newest starts prescription")).toBeInTheDocument();
    expect(screen.getByText("Starts")).toBeInTheDocument();
    expect(screen.getAllByText("Planned")).not.toHaveLength(0);
  });

  it("shows only the three most recent sessions", async () => {
    renderDashboard();
    expect(await screen.findByRole("link", { name: "View session: Newest starts" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View session: Second acceleration" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View session: Third speed work" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "View session: Older tempo" })).not.toBeInTheDocument();
  });

  it("links recent sessions to their detail routes", async () => {
    renderDashboard();
    expect(await screen.findByRole("link", { name: "View session: Newest starts" }))
      .toHaveAttribute("href", "/sessions/newest");
  });

  it("renders the intentional loading state", () => {
    api.getTrainingSessions.mockImplementation(() => new Promise(() => {}));
    renderDashboard();
    expect(screen.getByText("Gathering your recent training")).toBeInTheDocument();
  });

  it("renders the empty-session state", async () => {
    api.getTrainingSessions.mockResolvedValue([]);
    renderDashboard();
    expect(await screen.findByRole("heading", { name: "No sessions logged yet." })).toBeInTheDocument();
    expect(screen.getByText("Add your first session to start building your training history.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log your first session" })).toHaveAttribute(
      "href",
      "/sessions/new",
    );
  });

  it("keeps quick actions usable when recent training fails", async () => {
    api.getTrainingSessions.mockRejectedValue(new Error("private server detail"));
    renderDashboard();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Recent training is unavailable",
    );
    expect(screen.queryByText("private server detail")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Log a session/ })).toHaveAttribute(
      "href",
      "/sessions/new",
    );
    expect(screen.getByRole("link", { name: /View training/ })).toHaveAttribute(
      "href",
      "/sessions",
    );
  });
});
