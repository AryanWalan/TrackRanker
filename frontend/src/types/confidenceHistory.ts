import type { SessionType } from "./trainingSession";

export interface ConfidenceHistoryEntry {
  trainingSessionId: string;
  sessionTitle: string;
  sessionType: SessionType;
  sessionDate: string;
  confidenceBefore: number | null;
  confidenceAfter: number | null;
  wentWell: string | null;
  improved: string | null;
  wasDifficult: string | null;
  nextFocus: string | null;
  coachFeedback: string | null;
}

export interface ConfidenceHistory {
  totalReflectedSessions: number;
  sessionsWithConfidence: number;
  sessionsImproved: number;
  averageConfidenceBefore: number | null;
  averageConfidenceAfter: number | null;
  entries: ConfidenceHistoryEntry[];
}
