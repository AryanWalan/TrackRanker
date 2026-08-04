import { HealthStatus } from "../HealthStatus";
import { DashboardSection } from "./DashboardSection";

export function DashboardSystemStatus() {
  return (
    <DashboardSection
      className="dashboard-system-status"
      labelledBy="dashboard-system-status-title"
      tone="quiet"
    >
      <div className="dashboard-system-status__layout">
        <h2 id="dashboard-system-status-title">System status</h2>
        <HealthStatus />
      </div>
    </DashboardSection>
  );
}
