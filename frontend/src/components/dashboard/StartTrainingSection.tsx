import { Link } from "react-router-dom";
import { DashboardSection } from "./DashboardSection";

export function StartTrainingSection() {
  return (
    <DashboardSection
      className="dashboard-start"
      labelledBy="dashboard-start-title"
      tone="surface"
    >
      <div className="dashboard-section-heading">
        <p className="eyebrow">Take action</p>
        <h2 id="dashboard-start-title">Start training</h2>
        <p className="dashboard-section-support">
          Log what you're doing today or look back at sessions you've already recorded.
        </p>
      </div>
      <nav className="dashboard-actions" aria-label="Dashboard quick actions">
        <Link className="dashboard-action primary-action" to="/sessions/new">
          <span>Log a session</span>
          <small>Add today's or an upcoming training session.</small>
        </Link>
        <Link className="dashboard-action" to="/sessions">
          <span>Training history</span>
          <small>View, repeat, and manage sessions you've already logged.</small>
        </Link>
      </nav>
    </DashboardSection>
  );
}
