import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../App";

function renderApp(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>,
  );
}

describe("TrackRanker application", () => {
  it("renders the application name and primary navigation", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));
    renderApp();

    expect(screen.getByRole("heading", { name: "TrackRanker" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "TrackRanker logo" })).toHaveAttribute(
      "src",
      "/TrackRankerLogo.png",
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sessions" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Confidence" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Progress" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Profile" })).not.toBeInTheDocument();
  });

  it("navigates to the sessions route", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));
    renderApp();

    await user.click(screen.getByRole("link", { name: "Sessions" }));

    expect(screen.getByRole("heading", { name: "Training history" })).toBeInTheDocument();
  });

  it("redirects the retired profile route safely to the Dashboard", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));
    renderApp("/profile");

    expect(screen.getByRole("heading", { name: "TrackRanker" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Profile" })).not.toBeInTheDocument();
  });

  it("shows a successful mocked backend connection", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "Healthy",
          application: "TrackRanker.Api",
          timestampUtc: "2026-01-01T00:00:00Z",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    renderApp();

    expect(await screen.findByText("System connected")).toBeInTheDocument();
  });
});
