import type { AchievementProgress, Progress } from "./progress";

export interface CompletionProgressFeedback {
  xpChange: number | null;
  currentProgress: Progress | null;
  rankIncreased: boolean;
  newlyUnlockedAchievements: AchievementProgress[];
}

export interface CompletionNavigationState {
  progressFeedback?: CompletionProgressFeedback;
}
