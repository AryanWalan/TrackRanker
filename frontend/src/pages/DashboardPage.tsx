import { HealthStatus } from "../components/HealthStatus";

export function DashboardPage() {
  return (
    <>
      <section className="hero" aria-labelledby="dashboard-title">
        <p className="eyebrow">Sprint training, made clear</p>
        <h1 id="dashboard-title">TrackRanker</h1>
        <p className="tagline">Understand your training. Trust your progress.</p>
        <HealthStatus />
      </section>
      <section className="placeholder-card" aria-labelledby="coming-next">
        <p className="lane-number" aria-hidden="true">01</p>
        <div>
          <h2 id="coming-next">Your training overview starts here</h2>
          <p>Future milestones will bring prescribed sessions, reflection, and process-focused progress into one clear view.</p>
        </div>
      </section>
    </>
  );
}
