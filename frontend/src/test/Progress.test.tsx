import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../App";
import type { Progress } from "../types/progress";

const api = vi.hoisted(() => ({
  getProgress: vi.fn(),
  getTrainingSessions: vi.fn(),
}));

vi.mock("../services/trainingSessions", () => ({
  ...api,
  ApiError: class ApiError extends Error {},
}));

const progress: Progress = {
  totalXp: 120,
  trackRank: 2,
  currentRankXp: 20,
  xpPerRank: 100,
  completedSessions: 4,
  meaningfulReflections: 3,
  pairedConfidenceCheckIns: 2,
  achievements: [
    {
      id: "first-finish",
      name: "First Finish",
      description: "Log your first completed training session.",
      isUnlocked: true,
      currentProgress: 1,
      requiredProgress: 1,
    },
    {
      id: "building-routine",
      name: "Building Routine",
      description: "Log five completed training sessions.",
      isUnlocked: false,
      currentProgress: 4,
      requiredProgress: 5,
    },
  ],
};

function renderRoute(path = "/progress") {
  vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("Progress", () => {
  beforeEach(() => {
    api.getProgress.mockResolvedValue(progress);
    api.getTrainingSessions.mockImplementation(() => new Promise(() => {}));
  });

  it("renders a loading state", () => {
    api.getProgress.mockImplementation(() => new Promise(() => {}));
    renderRoute();
    expect(screen.getByText("Calculating your training-process progress…")).toBeInTheDocument();
  });

  it("renders TrackRank 1 for empty progress", async () => {
    api.getProgress.mockResolvedValue({
      ...progress,
      totalXp: 0,
      trackRank: 1,
      currentRankXp: 0,
      completedSessions: 0,
      meaningfulReflections: 0,
      pairedConfidenceCheckIns: 0,
      achievements: [],
    });
    renderRoute();
    expect(await screen.findByRole("heading", { name: "TrackRank 1" })).toBeInTheDocument();
  });

  it("renders total XP and rank progress", async () => {
    renderRoute();
    expect(await screen.findByText("120 XP")).toBeInTheDocument();
    expect(screen.getByText("20 / 100 XP to next rank")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: /20 \/ 100 XP to next rank/ }))
      .toHaveAttribute("value", "20");
  });

  it("shows transparent XP earning rules", async () => {
    renderRoute();
    expect(await screen.findByText("Complete a session")).toBeInTheDocument();
    expect(screen.getByText("+20 XP")).toBeInTheDocument();
    expect(screen.getByText("+10 XP")).toBeInTheDocument();
    expect(screen.getByText("+5 XP")).toBeInTheDocument();
  });

  it("renders process totals", async () => {
    renderRoute();
    await screen.findByRole("heading", { name: "Your process" });
    expect(screen.getByText("Completed sessions")).toBeInTheDocument();
    expect(screen.getByText("Reflections")).toBeInTheDocument();
    expect(screen.getByText("Confidence check-ins")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders unlocked achievements with text status", async () => {
    renderRoute();
    expect(await screen.findByRole("heading", { name: "First Finish" })).toBeInTheDocument();
    expect(screen.getByText("Unlocked")).toBeInTheDocument();
  });

  it("renders locked achievement progress", async () => {
    renderRoute();
    expect(await screen.findByRole("heading", { name: "Building Routine" })).toBeInTheDocument();
    expect(screen.getByText("4 / 5 progress")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Building Routine: 4 of 5" }))
      .toHaveAttribute("value", "4");
  });

  it("renders a useful API error state", async () => {
    api.getProgress.mockRejectedValue(new Error("private error"));
    renderRoute();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Progress could not be loaded right now",
    );
    expect(screen.queryByText("private error")).not.toBeInTheDocument();
  });

  it("includes Progress in primary navigation", () => {
    api.getProgress.mockImplementation(() => new Promise(() => {}));
    renderRoute();
    expect(screen.getByRole("link", { name: "Progress" })).toHaveAttribute(
      "href",
      "/progress",
    );
  });

  it("navigates to the Progress page", async () => {
    const user = userEvent.setup();
    api.getProgress.mockImplementation(() => new Promise(() => {}));
    renderRoute("/");
    await user.click(screen.getByRole("link", { name: "Progress" }));
    expect(screen.getByRole("heading", { name: "Your TrackRank" })).toBeInTheDocument();
  });
});
