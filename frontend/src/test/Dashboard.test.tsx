import { render, screen, within } from "@testing-library/react";
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

const progress = {
  totalXp: 120,
  trackRank: 2,
  currentRankXp: 20,
  xpPerRank: 100,
  completedSessions: 4,
  meaningfulReflections: 3,
  pairedConfidenceCheckIns: 2,
  achievements: [],
};

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

function renderDashboard(healthRequest = new Promise<Response>(() => {})) {
  vi.spyOn(globalThis, "fetch").mockReturnValue(healthRequest);
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>,
  );
}

function getSection(name: string) {
  return screen.getByRole("region", { name });
}

describe("Dashboard", () => {
  beforeEach(() => {
    api.getTrainingSessions.mockImplementation(() => new Promise(() => {}));
    api.getProgress.mockImplementation(() => new Promise(() => {}));
  });

  it("renders the hero with one page heading and the sprinter-focused explanation", () => {
    renderDashboard();

    expect(screen.getByRole("heading", { name: "TrackRanker", level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText("For 100m, 200m and 400m sprinters")).toBeInTheDocument();
    expect(screen.getByText(
      "Training clarity and confidence for 100m, 200m and 400m sprinters.",
    )).toBeInTheDocument();
    expect(screen.getByText(/Log what your coach gives you/)).toHaveTextContent(
      "reflect on how they went, and build confidence from your own training",
    );
  });

  it("renders all six labelled sections in the intended order", () => {
    renderDashboard();

    const sectionNames = screen.getAllByRole("region").map((section) =>
      within(section).getByRole("heading", { level: section === getSection("TrackRanker") ? 1 : 2 })
        .textContent,
    );

    expect(sectionNames).toEqual([
      "TrackRanker",
      "How TrackRanker works",
      "Start training",
      "Your training progress",
      "Recent training",
      "System status",
    ]);
  });

  it("renders the workflow steps and descriptions in logical order", () => {
    renderDashboard();
    const workflow = getSection("How TrackRanker works");

    expect(within(workflow).getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent))
      .toEqual(["Log your session", "Complete and reflect", "Build confidence"]);
    expect(within(workflow).getByText("1")).toBeInTheDocument();
    expect(within(workflow).getByText("2")).toBeInTheDocument();
    expect(within(workflow).getByText("3")).toBeInTheDocument();
    expect(within(workflow).getByText(
      "Add the training session your coach has prescribed.",
    )).toBeInTheDocument();
    expect(within(workflow).getByText(
      "Record how the session went, what you learned, and how confident you felt.",
    )).toBeInTheDocument();
    expect(within(workflow).getByText(
      "Look back at your training evidence, reflections, and progress.",
    )).toBeInTheDocument();
  });

  it("keeps the hero and Start training actions on their intended routes", () => {
    renderDashboard();
    const hero = getSection("TrackRanker");
    const start = getSection("Start training");

    expect(within(hero).getByRole("link", { name: "Log a session" }))
      .toHaveAttribute("href", "/sessions/new");
    expect(within(hero).getByRole("link", { name: "View training history" }))
      .toHaveAttribute("href", "/sessions");
    expect(within(start).getByRole("link", { name: /Log a session/ }))
      .toHaveAttribute("href", "/sessions/new");
    expect(within(start).getByRole("link", { name: /Training history/ }))
      .toHaveAttribute("href", "/sessions");
    expect(within(start).getByRole("link", { name: /Log a session/ }))
      .not.toHaveAccessibleName(within(start).getByRole("link", { name: /Training history/ }).textContent ?? "");
  });

  it("renders the required section introductions", () => {
    renderDashboard();

    expect(within(getSection("Start training")).getByText("Take action")).toBeInTheDocument();
    expect(screen.getByText(
      "Log what you're doing today or look back at sessions you've already recorded.",
    )).toBeInTheDocument();
    expect(screen.getByText(
      "TrackRank rewards completing sessions, reflecting, and checking in with your confidence.",
    )).toBeInTheDocument();
    expect(screen.getByText("Quickly return to your latest logged sessions.")).toBeInTheDocument();
  });

  it("renders recent sessions returned by the API", async () => {
    api.getTrainingSessions.mockResolvedValue(sessions);
    renderDashboard();
    expect(await screen.findByText("Newest starts prescription")).toBeInTheDocument();
    expect(screen.getByText("Starts")).toBeInTheDocument();
    expect(screen.getAllByText("Planned")).not.toHaveLength(0);
  });

  it("shows only the three most recent sessions in newest-first order", async () => {
    api.getTrainingSessions.mockResolvedValue(sessions);
    renderDashboard();
    const recent = getSection("Recent training");
    await within(recent).findByRole("link", { name: "View session: Newest starts" });

    expect(within(recent).getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent))
      .toEqual([
        "View session: Newest starts",
        "View session: Second acceleration",
        "View session: Third speed work",
      ]);
    expect(within(recent).queryByRole("link", { name: "View session: Older tempo" }))
      .not.toBeInTheDocument();
  });

  it("links recent sessions and the all-sessions action correctly", async () => {
    api.getTrainingSessions.mockResolvedValue(sessions);
    renderDashboard();
    const recent = getSection("Recent training");

    expect(await within(recent).findByRole("link", { name: "View session: Newest starts" }))
      .toHaveAttribute("href", "/sessions/newest");
    expect(within(recent).getByRole("link", { name: "View all sessions" }))
      .toHaveAttribute("href", "/sessions");
  });

  it("renders the intentional recent-training loading state", () => {
    api.getTrainingSessions.mockImplementation(() => new Promise(() => {}));
    renderDashboard();
    expect(screen.getByText("Gathering your recent training")).toBeInTheDocument();
  });

  it("renders the exact empty-session guidance and action", async () => {
    api.getTrainingSessions.mockResolvedValue([]);
    renderDashboard();
    const recent = getSection("Recent training");

    expect(await within(recent).findByRole("heading", { name: "No sessions logged yet." }))
      .toBeInTheDocument();
    expect(within(recent).getByText(
      "Log your first training session to start building your training history.",
    )).toBeInTheDocument();
    expect(within(recent).getByRole("link", { name: "Log a session" }))
      .toHaveAttribute("href", "/sessions/new");
  });

  it("keeps primary actions and progress usable when recent training fails", async () => {
    api.getTrainingSessions.mockRejectedValue(new Error("private server detail"));
    api.getProgress.mockResolvedValue(progress);
    renderDashboard();

    expect(await screen.findByRole("alert")).toHaveTextContent("Recent training is unavailable");
    expect(screen.queryByText("private server detail")).not.toBeInTheDocument();
    expect(within(getSection("Start training")).getByRole("link", { name: /Log a session/ }))
      .toHaveAttribute("href", "/sessions/new");
    expect(await screen.findByRole("heading", { name: "TrackRank 2", level: 3 }))
      .toBeInTheDocument();
  });

  it("displays the TrackRank summary and accessible current-rank progress", async () => {
    api.getProgress.mockResolvedValue(progress);
    renderDashboard();

    expect(await screen.findByRole("heading", { name: "TrackRank 2", level: 3 }))
      .toBeInTheDocument();
    expect(screen.getByText("120 XP")).toBeInTheDocument();
    expect(screen.getByText("20 / 100 to next rank")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "TrackRank 2 progress" }))
      .toHaveAttribute("value", "20");
    expect(screen.getByText(
      "TrackRank reflects engagement with your training process, not sprint ability.",
    )).toBeInTheDocument();
  });

  it("links the TrackRank summary to Progress", async () => {
    api.getProgress.mockResolvedValue(progress);
    renderDashboard();
    expect(await screen.findByRole("link", { name: "View progress" }))
      .toHaveAttribute("href", "/progress");
  });

  it("keeps actions and recent training usable when progress fails", async () => {
    api.getTrainingSessions.mockResolvedValue(sessions);
    api.getProgress.mockRejectedValue(new Error("private progress error"));
    renderDashboard();

    expect(await screen.findByText("Progress is unavailable right now.")).toBeInTheDocument();
    expect(screen.queryByText("private progress error")).not.toBeInTheDocument();
    expect(within(getSection("Start training")).getByRole("link", { name: /Log a session/ }))
      .toHaveAttribute("href", "/sessions/new");
    expect(await screen.findByText("Newest starts prescription")).toBeInTheDocument();
  });

  it("uses quiet athlete-facing wording for a successful health check", async () => {
    const response = new Response(JSON.stringify({ status: "Healthy" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    renderDashboard(Promise.resolve(response));

    const systemStatus = getSection("System status");
    expect(await within(systemStatus).findByText("System connected")).toBeInTheDocument();
    expect(systemStatus).not.toHaveTextContent("api");
    expect(systemStatus).not.toHaveTextContent("HTTP");
    expect(systemStatus).not.toHaveTextContent("MongoDB");
  });

  it("limits a failed health check to athlete-facing system status", async () => {
    renderDashboard(Promise.reject(new Error("HTTP 500 from /api/health")));

    expect(await within(getSection("System status")).findByText("Connection unavailable"))
      .toBeInTheDocument();
    expect(screen.queryByText("HTTP 500 from /api/health")).not.toBeInTheDocument();
    expect(within(getSection("Start training")).getByRole("link", { name: /Training history/ }))
      .toHaveAttribute("href", "/sessions");
  });

  it("preserves the official logo, Dashboard navigation, and retired Profile state", () => {
    renderDashboard();

    expect(screen.getByRole("img", { name: "TrackRanker logo" }))
      .toHaveAttribute("src", "/TrackRankerLogo.png");
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/");
    expect(screen.queryByRole("link", { name: "Profile" })).not.toBeInTheDocument();
  });
});
