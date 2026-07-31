import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  sessionStatuses,
  sessionTypes,
  type SessionType,
  type TrainingSessionInput,
  type TrainingSessionStatus,
} from "../types/trainingSession";

export type SessionTypeFilter = SessionType | "All";
export type SessionStatusFilter = TrainingSessionStatus | "All";

interface TrackRankerState {
  sessionDraft: TrainingSessionInput | null;
  sessionTypeFilter: SessionTypeFilter;
  sessionStatusFilter: SessionStatusFilter;
  confidenceTypeFilter: SessionTypeFilter;
  setSessionDraft: (draft: TrainingSessionInput) => void;
  setSessionDraftField: <K extends keyof TrainingSessionInput>(
    field: K,
    value: TrainingSessionInput[K],
  ) => void;
  clearSessionDraft: () => void;
  hasSessionDraft: () => boolean;
  setSessionTypeFilter: (filter: SessionTypeFilter) => void;
  setSessionStatusFilter: (filter: SessionStatusFilter) => void;
  resetSessionFilters: () => void;
  setConfidenceTypeFilter: (filter: SessionTypeFilter) => void;
  resetConfidenceFilter: () => void;
}

export const trackRankerInitialState = {
  sessionDraft: null,
  sessionTypeFilter: "All" as SessionTypeFilter,
  sessionStatusFilter: "All" as SessionStatusFilter,
  confidenceTypeFilter: "All" as SessionTypeFilter,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSessionType(value: unknown): value is SessionType {
  return typeof value === "string"
    && sessionTypes.includes(value as SessionType);
}

function isSessionStatus(value: unknown): value is TrainingSessionStatus {
  return typeof value === "string"
    && sessionStatuses.includes(value as TrainingSessionStatus);
}

function safeTypeFilter(value: unknown): SessionTypeFilter {
  return value === "All" || isSessionType(value) ? value : "All";
}

function safeStatusFilter(value: unknown): SessionStatusFilter {
  return value === "All" || isSessionStatus(value) ? value : "All";
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function safeSessionDraft(value: unknown): TrainingSessionInput | null {
  if (!isRecord(value)) return null;

  const intendedIntensity = value.intendedIntensity;
  const hasSafeIntensity = intendedIntensity === null
    || (
      typeof intendedIntensity === "number"
      && Number.isFinite(intendedIntensity)
      && intendedIntensity >= 0
      && intendedIntensity <= 100
    );

  if (
    typeof value.title !== "string"
    || !isSessionType(value.sessionType)
    || typeof value.sessionDate !== "string"
    || typeof value.prescription !== "string"
    || !isNullableString(value.purpose)
    || !isNullableString(value.focusCue)
    || !isNullableString(value.successCriteria)
    || !hasSafeIntensity
    || !isNullableString(value.coachNotes)
    || !isSessionStatus(value.status)
  ) {
    return null;
  }

  return {
    title: value.title,
    sessionType: value.sessionType,
    sessionDate: value.sessionDate,
    prescription: value.prescription,
    purpose: value.purpose,
    focusCue: value.focusCue,
    successCriteria: value.successCriteria,
    intendedIntensity,
    coachNotes: value.coachNotes,
    status: value.status,
  };
}

export const useTrackRankerStore = create<TrackRankerState>()(
  persist(
    (set, get) => ({
      ...trackRankerInitialState,
      setSessionDraft: (sessionDraft) => set({ sessionDraft }),
      setSessionDraftField: (field, value) => set((state) => ({
        sessionDraft: state.sessionDraft
          ? { ...state.sessionDraft, [field]: value }
          : null,
      })),
      clearSessionDraft: () => set({ sessionDraft: null }),
      hasSessionDraft: () => get().sessionDraft !== null,
      setSessionTypeFilter: (sessionTypeFilter) => set({ sessionTypeFilter }),
      setSessionStatusFilter: (sessionStatusFilter) => set({ sessionStatusFilter }),
      resetSessionFilters: () => set({
        sessionTypeFilter: "All",
        sessionStatusFilter: "All",
      }),
      setConfidenceTypeFilter: (confidenceTypeFilter) => set({ confidenceTypeFilter }),
      resetConfidenceFilter: () => set({ confidenceTypeFilter: "All" }),
    }),
    {
      name: "trackranker-workspace",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessionDraft: state.sessionDraft,
        sessionTypeFilter: state.sessionTypeFilter,
        sessionStatusFilter: state.sessionStatusFilter,
        confidenceTypeFilter: state.confidenceTypeFilter,
      }),
      migrate: (persistedState) => persistedState,
      merge: (persistedState, currentState) => {
        const persisted = isRecord(persistedState) ? persistedState : {};
        return {
          ...currentState,
          sessionDraft: safeSessionDraft(persisted.sessionDraft),
          sessionTypeFilter: safeTypeFilter(persisted.sessionTypeFilter),
          sessionStatusFilter: safeStatusFilter(persisted.sessionStatusFilter),
          confidenceTypeFilter: safeTypeFilter(persisted.confidenceTypeFilter),
        };
      },
    },
  ),
);
