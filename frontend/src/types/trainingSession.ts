export const sessionTypes = [
  "Acceleration",
  "MaxVelocity",
  "SpeedEndurance",
  "SpecialEndurance",
  "Tempo",
  "Starts",
  "Competition",
  "Recovery",
  "Other",
] as const;

export const sessionStatuses = ["Planned", "Completed", "Cancelled"] as const;

export type SessionType = (typeof sessionTypes)[number];
export type TrainingSessionStatus = (typeof sessionStatuses)[number];

export interface TrainingSession {
  id: string;
  title: string;
  sessionType: SessionType;
  sessionDate: string;
  prescription: string;
  purpose: string | null;
  focusCue: string | null;
  successCriteria: string | null;
  intendedIntensity: number | null;
  coachNotes: string | null;
  status: TrainingSessionStatus;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface TrainingSessionInput {
  title: string;
  sessionType: SessionType;
  sessionDate: string;
  prescription: string;
  purpose: string | null;
  focusCue: string | null;
  successCriteria: string | null;
  intendedIntensity: number | null;
  coachNotes: string | null;
  status: TrainingSessionStatus;
}
