import { DashboardSection } from "./DashboardSection";

export function HowItWorksSection() {
  return (
    <DashboardSection
      className="dashboard-workflow"
      labelledBy="dashboard-workflow-title"
      tone="neutral"
    >
      <div className="dashboard-workflow-heading">
        <p className="eyebrow">Start here</p>
        <h2 id="dashboard-workflow-title">How TrackRanker works</h2>
      </div>
      <ol>
        <li>
          <span aria-hidden="true">1</span>
          <div>
            <h3>Log your session</h3>
            <p>Add the training session your coach has prescribed.</p>
          </div>
        </li>
        <li>
          <span aria-hidden="true">2</span>
          <div>
            <h3>Complete and reflect</h3>
            <p>Record how the session went, what you learned, and how confident you felt.</p>
          </div>
        </li>
        <li>
          <span aria-hidden="true">3</span>
          <div>
            <h3>Build confidence</h3>
            <p>Look back at your training evidence, reflections, and progress.</p>
          </div>
        </li>
      </ol>
    </DashboardSection>
  );
}
