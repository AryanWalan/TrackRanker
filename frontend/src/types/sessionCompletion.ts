export interface RepetitionResult {
  setNumber: number;
  repetitionNumber: number;
  distanceMetres: number;
  timeSeconds: number;
  notes: string | null;
}

export interface SessionReflection {
  wentWell: string | null;
  improved: string | null;
  wasDifficult: string | null;
  nextFocus: string | null;
  coachFeedback: string | null;
  confidenceBefore: number | null;
  confidenceAfter: number | null;
}

export interface SessionCompletionInput {
  actualIntensity: number;
  perceivedDifficulty: number;
  repetitionResults: RepetitionResult[];
  reflection: SessionReflection;
}

export type CreateSessionCompletionRequest = SessionCompletionInput;
export type UpdateSessionCompletionRequest = SessionCompletionInput;

export interface SessionCompletion extends SessionCompletionInput {
  id: string;
  trainingSessionId: string;
  completedAtUtc: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}
