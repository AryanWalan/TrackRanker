import { Link } from "react-router-dom";
import { DashboardSection } from "./DashboardSection";

export function DashboardHero() {
  return (
    <DashboardSection
      className="dashboard-introduction"
      labelledBy="dashboard-title"
      tone="brand"
    >
      <header className="hero">
        <p className="eyebrow">For 100m, 200m and 400m sprinters</p>
        <h1 id="dashboard-title">TrackRanker</h1>
        <p className="tagline">
          Training clarity and confidence for 100m, 200m and 400m sprinters.
        </p>
        <p className="hero-support">
          Log what your coach gives you, understand your sessions, reflect on how they went,
          and build confidence from your own training.
        </p>
        <div className="hero-actions">
          <Link className="button primary" to="/sessions/new">Log a session</Link>
          <Link className="hero-secondary-link" to="/sessions">View training history</Link>
        </div>
      </header>
    </DashboardSection>
  );
}
