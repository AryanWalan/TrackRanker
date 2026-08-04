import { useEffect, useMemo, useState } from "react";
import { DashboardHero } from "../components/dashboard/DashboardHero";
import { DashboardSystemStatus } from "../components/dashboard/DashboardSystemStatus";
import { HowItWorksSection } from "../components/dashboard/HowItWorksSection";
import { RecentTrainingSection } from "../components/dashboard/RecentTrainingSection";
import { StartTrainingSection } from "../components/dashboard/StartTrainingSection";
import { TrainingProgressSection } from "../components/dashboard/TrainingProgressSection";
import { getProgress, getTrainingSessions } from "../services/trainingSessions";
import type { Progress } from "../types/progress";
import type { TrainingSession } from "../types/trainingSession";

export function DashboardPage() {
  const [sessions, setSessions] = useState<TrainingSession[] | null>(null);
  const [sessionsError, setSessionsError] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [progressError, setProgressError] = useState(false);

  useEffect(() => {
    let active = true;
    getTrainingSessions()
      .then((result) => {
        if (active) setSessions(result);
      })
      .catch(() => {
        if (active) setSessionsError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    getProgress()
      .then((result) => {
        if (active) setProgress(result);
      })
      .catch(() => {
        if (active) setProgressError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const recentSessions = useMemo(
    () => sessions
      ? [...sessions]
          .sort((left, right) => right.sessionDate.localeCompare(left.sessionDate))
          .slice(0, 3)
      : [],
    [sessions],
  );

  return (
    <div className="dashboard-page">
      <DashboardHero />
      <HowItWorksSection />
      <StartTrainingSection />
      <TrainingProgressSection error={progressError} progress={progress} />
      <RecentTrainingSection
        error={sessionsError}
        recentSessions={recentSessions}
        sessions={sessions}
      />
      <DashboardSystemStatus />
    </div>
  );
}
