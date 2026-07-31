import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../App";
import type { TrainingSession } from "../types/trainingSession";

const api = vi.hoisted(() => ({
  getTrainingSessions: vi.fn(),
  getProgress: vi.fn(),
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
    api.getProgress.mockImplementation(() => new Promise(() => {}));
  });

  it("explains who TrackRanker is for and its core purpose", () => {
    api.getTrainingSessions.mockImplementation(() => new Promise(() => {}));
    renderDashboard();
    expect(screen.getByRole("heading", { name: "TrackRanker" })).toBeInTheDocument();
    expect(screen.getByText(/Training clarity and confidence for 100m, 200m and 400m sprinters/))
      .toBeInTheDocument();
    expect(screen.getByText(/Log what your coach gives you/)).toHaveTextContent(
      "reflect on how they went, and build confidence from your own training",
    );
  });

  it("renders the three-step TrackRanker workflow", () => {
    api.getTrainingSessions.mockImplementation(() => new Promise(() => {}));
    renderDashboard();
    expect(screen.getByRole("heading", { name: "How TrackRanker works" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Log your session" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Complete and reflect" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Build confidence" })).toBeInTheDocument();
  });

  it("links Log a session to session creation", () => {
    api.getTrainingSessions.mockImplementation(() => new Promise(() => {}));
    renderDashboard();
    expect(screen.getByRole("link", { name: /Log a session/ })).toHaveAttribute(
      "href",
      "/sessions/new",
    );
  });

  it("links the distinctly labelled Training history action to the sessions list", () => {
    api.getTrainingSessions.mockImplementation(() => new Promise(() => {}));
    renderDashboard();
    expect(screen.getByRole("link", { name: /Training history/ })).toHaveAttribute(
      "href",
      "/sessions",
    );
    expect(screen.getByRole("link", { name: /Log a session/ })).toBeInTheDocument();
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
    expect(screen.getByRole("link", { name: /Training history/ })).toHaveAttribute(
      "href",
      "/sessions",
    );
  });

  it("displays a small TrackRank summary", async () => {
    api.getProgress.mockResolvedValue({
      totalXp: 120,
      trackRank: 2,
      currentRankXp: 20,
      xpPerRank: 100,
      completedSessions: 4,
      meaningfulReflections: 3,
      pairedConfidenceCheckIns: 2,
      achievements: [],
    });
    renderDashboard();
    expect(await screen.findByRole("heading", { name: "TrackRank 2" })).toBeInTheDocument();
    expect(screen.getByText("120 XP")).toBeInTheDocument();
    expect(screen.getByText("20 / 100 to next rank")).toBeInTheDocument();
  });

  it("links the TrackRank summary to Progress", async () => {
    api.getProgress.mockResolvedValue({
      totalXp: 0,
      trackRank: 1,
      currentRankXp: 0,
      xpPerRank: 100,
      completedSessions: 0,
      meaningfulReflections: 0,
      pairedConfidenceCheckIns: 0,
      achievements: [],
    });
    renderDashboard();
    expect(await screen.findByRole("link", { name: "View progress" }))
      .toHaveAttribute("href", "/progress");
  });

  it("remains usable when progress fails", async () => {
    api.getProgress.mockRejectedValue(new Error("private progress error"));
    renderDashboard();
    expect(await screen.findByText("Progress is unavailable right now.")).toBeInTheDocument();
    expect(screen.queryByText("private progress error")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Log a session/ })).toHaveAttribute(
      "href",
      "/sessions/new",
    );
    expect(await screen.findByText("Newest starts prescription")).toBeInTheDocument();
  });
});
