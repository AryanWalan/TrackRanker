import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../App";
import type { ConfidenceHistory } from "../types/confidenceHistory";

const api = vi.hoisted(() => ({
  getConfidenceHistory: vi.fn(),
}));

vi.mock("../services/trainingSessions", () => ({
  ...api,
  ApiError: class ApiError extends Error {},
}));

const history: ConfidenceHistory = {
  totalReflectedSessions: 3,
  sessionsWithConfidence: 3,
  sessionsImproved: 1,
  averageConfidenceBefore: 3,
  averageConfidenceAfter: 3.3,
  entries: [
    {
      trainingSessionId: "507f1f77bcf86cd799439011",
      sessionTitle: "Speed Endurance — 3 × 150m",
      sessionType: "SpeedEndurance",
      sessionDate: "2026-08-12",
      confidenceBefore: 2,
      confidenceAfter: 4,
      wentWell: "Stayed relaxed through the final 50m.",
      improved: "Times were more consistent.",
      wasDifficult: "The final repetition.",
      nextFocus: "Stay patient early.",
      coachFeedback: "Good rhythm.",
    },
    {
      trainingSessionId: "507f1f77bcf86cd799439012",
      sessionTitle: "Block starts",
      sessionType: "Acceleration",
      sessionDate: "2026-08-10",
      confidenceBefore: 3,
      confidenceAfter: 3,
      wentWell: "Strong first step.",
      improved: null,
      wasDifficult: null,
      nextFocus: null,
      coachFeedback: null,
    },
    {
      trainingSessionId: "507f1f77bcf86cd799439013",
      sessionTitle: "Fly work",
      sessionType: "MaxVelocity",
      sessionDate: "2026-08-08",
      confidenceBefore: 4,
      confidenceAfter: 3,
      wentWell: null,
      improved: null,
      wasDifficult: "Relaxation was difficult.",
      nextFocus: null,
      coachFeedback: null,
    },
  ],
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/confidence"]}>
      <App />
    </MemoryRouter>,
  );
}

describe("confidence history", () => {
  beforeEach(() => {
    api.getConfidenceHistory.mockResolvedValue(history);
  });

  it("renders a loading state", () => {
    api.getConfidenceHistory.mockImplementation(() => new Promise(() => {}));
    renderPage();
    expect(screen.getByText("Loading confidence history…")).toBeInTheDocument();
  });

  it("renders a useful empty state", async () => {
    api.getConfidenceHistory.mockResolvedValue({
      totalReflectedSessions: 0,
      sessionsWithConfidence: 0,
      sessionsImproved: 0,
      averageConfidenceBefore: null,
      averageConfidenceAfter: null,
      entries: [],
    });
    renderPage();
    expect(await screen.findByRole("heading", { name: "No confidence history yet." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View sessions" })).toHaveAttribute("href", "/sessions");
  });

  it("renders summary metrics from the API", async () => {
    renderPage();
    expect(await screen.findByText("3.0 / 5")).toBeInTheDocument();
    expect(screen.getByText("1 of 3")).toBeInTheDocument();
    expect(screen.getByText("3.3 / 5")).toBeInTheDocument();
  });

  it("renders before, after, and a positive delta", async () => {
    renderPage();
    expect(await screen.findByText("2 / 5")).toBeInTheDocument();
    expect(screen.getAllByText("4 / 5")).not.toHaveLength(0);
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("labels unchanged and negative changes neutrally", async () => {
    renderPage();
    expect(await screen.findByText("No change")).toBeInTheDocument();
    expect(screen.getByText("-1")).toBeInTheDocument();
  });

  it("renders reflection evidence", async () => {
    renderPage();
    expect(await screen.findByText("Stayed relaxed through the final 50m.")).toBeInTheDocument();
    expect(screen.getByText("Times were more consistent.")).toBeInTheDocument();
    expect(screen.getByText("Good rhythm.")).toBeInTheDocument();
  });

  it("filters evidence by the existing session types", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Speed Endurance — 3 × 150m");
    await user.selectOptions(screen.getByLabelText("Session type"), "Acceleration");
    expect(screen.getByText("Block starts")).toBeInTheDocument();
    expect(screen.queryByText("Speed Endurance — 3 × 150m")).not.toBeInTheDocument();
  });

  it("links evidence to the source session", async () => {
    renderPage();
    expect(await screen.findByRole("link", {
      name: "View session: Speed Endurance — 3 × 150m",
    })).toHaveAttribute("href", "/sessions/507f1f77bcf86cd799439011");
  });

  it("renders reflection-only partial data without a chart", async () => {
    api.getConfidenceHistory.mockResolvedValue({
      totalReflectedSessions: 1,
      sessionsWithConfidence: 0,
      sessionsImproved: 0,
      averageConfidenceBefore: null,
      averageConfidenceAfter: null,
      entries: [{ ...history.entries[0], confidenceBefore: null, confidenceAfter: null }],
    });
    renderPage();
    expect(await screen.findByText(/comparisons will appear/)).toBeInTheDocument();
    expect(screen.getByText("Stayed relaxed through the final 50m.")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /Before and after training/ })).not.toBeInTheDocument();
  });

  it("renders a partial confidence value without inventing a delta", async () => {
    api.getConfidenceHistory.mockResolvedValue({
      ...history,
      sessionsWithConfidence: 0,
      averageConfidenceAfter: null,
      entries: [{ ...history.entries[0], confidenceAfter: null }],
    });
    renderPage();
    expect(await screen.findByText("Not recorded")).toBeInTheDocument();
    expect(screen.queryByText("+2")).not.toBeInTheDocument();
  });

  it("shows an API error state", async () => {
    api.getConfidenceHistory.mockRejectedValue(new Error("offline"));
    renderPage();
    expect(await screen.findByRole("alert")).toHaveTextContent("Confidence history could not be loaded");
  });

  it("renders the expected accessible chart data", async () => {
    renderPage();
    const chart = await screen.findByRole("img", { name: /Before and after training/ });
    expect(chart).toBeInTheDocument();
    expect(screen.getByText(/12 August 2026: before 2 of 5, after 4 of 5/)).toBeInTheDocument();
    expect(chart.querySelectorAll("circle")).toHaveLength(3);
    expect(chart.querySelectorAll("rect")).toHaveLength(3);
  });

  it("shows a filtered empty state", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Block starts");
    await user.selectOptions(screen.getByLabelText("Session type"), "Competition");
    expect(screen.getByText("No confidence evidence for this session type.")).toBeInTheDocument();
  });

  it("calls the confidence-history API once", async () => {
    renderPage();
    await waitFor(() => expect(api.getConfidenceHistory).toHaveBeenCalledTimes(1));
  });
});
