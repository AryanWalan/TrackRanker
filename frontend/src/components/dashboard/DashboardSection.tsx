import type { ReactNode } from "react";

type DashboardSectionTone = "brand" | "neutral" | "surface" | "progress" | "quiet";

interface DashboardSectionProps {
  children: ReactNode;
  className?: string;
  labelledBy: string;
  tone: DashboardSectionTone;
}

export function DashboardSection({
  children,
  className,
  labelledBy,
  tone,
}: DashboardSectionProps) {
  const classes = [
    "dashboard-section",
    `dashboard-section--${tone}`,
    className,
  ].filter(Boolean).join(" ");

  return (
    <section className={classes} aria-labelledby={labelledBy}>
      <div className="dashboard-section__content">{children}</div>
    </section>
  );
}
