export interface AchievementProgress {
  id: string;
  name: string;
  description: string;
  isUnlocked: boolean;
  currentProgress: number;
  requiredProgress: number;
}

export interface Progress {
  totalXp: number;
  trackRank: number;
  currentRankXp: number;
  xpPerRank: number;
  completedSessions: number;
  meaningfulReflections: number;
  pairedConfidenceCheckIns: number;
  achievements: AchievementProgress[];
}
