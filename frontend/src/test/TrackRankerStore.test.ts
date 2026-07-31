import {
  trackRankerInitialState,
  useTrackRankerStore,
} from "../stores/useTrackRankerStore";
import type { TrainingSessionInput } from "../types/trainingSession";

const draft: TrainingSessionInput = {
  title: "",
  sessionType: "SpeedEndurance",
  sessionDate: "2026-08-01",
  prescription: "3 x 150m",
  purpose: "Develop speed endurance.",
  focusCue: null,
  successCriteria: null,
  intendedIntensity: 90,
  coachNotes: null,
  status: "Planned",
};

describe("TrackRanker Zustand store", () => {
  it("starts with the expected defaults", () => {
    expect(useTrackRankerStore.getState()).toMatchObject(trackRankerInitialState);
    expect(useTrackRankerStore.getState().hasSessionDraft()).toBe(false);
  });

  it("sets and updates session draft values", () => {
    useTrackRankerStore.getState().setSessionDraft(draft);
    useTrackRankerStore.getState().setSessionDraftField(
      "prescription",
      "4 x 120m",
    );

    expect(useTrackRankerStore.getState().sessionDraft).toEqual({
      ...draft,
      prescription: "4 x 120m",
    });
    expect(useTrackRankerStore.getState().hasSessionDraft()).toBe(true);
  });

  it("clears the session draft", () => {
    useTrackRankerStore.getState().setSessionDraft(draft);
    useTrackRankerStore.getState().clearSessionDraft();

    expect(useTrackRankerStore.getState().sessionDraft).toBeNull();
  });

  it("updates the session type filter", () => {
    useTrackRankerStore.getState().setSessionTypeFilter("Tempo");

    expect(useTrackRankerStore.getState().sessionTypeFilter).toBe("Tempo");
  });

  it("updates the session status filter", () => {
    useTrackRankerStore.getState().setSessionStatusFilter("Completed");

    expect(useTrackRankerStore.getState().sessionStatusFilter).toBe("Completed");
  });

  it("resets both session filters", () => {
    useTrackRankerStore.getState().setSessionTypeFilter("Tempo");
    useTrackRankerStore.getState().setSessionStatusFilter("Completed");
    useTrackRankerStore.getState().resetSessionFilters();

    expect(useTrackRankerStore.getState()).toMatchObject({
      sessionTypeFilter: "All",
      sessionStatusFilter: "All",
    });
  });

  it("updates the confidence type filter", () => {
    useTrackRankerStore.getState().setConfidenceTypeFilter("Acceleration");

    expect(useTrackRankerStore.getState().confidenceTypeFilter).toBe("Acceleration");
  });

  it("resets the confidence filter", () => {
    useTrackRankerStore.getState().setConfidenceTypeFilter("Acceleration");
    useTrackRankerStore.getState().resetConfidenceFilter();

    expect(useTrackRankerStore.getState().confidenceTypeFilter).toBe("All");
  });

  it("rehydrates persisted draft and filter state", async () => {
    useTrackRankerStore.getState().setSessionDraft(draft);
    useTrackRankerStore.getState().setSessionTypeFilter("Tempo");
    useTrackRankerStore.getState().setSessionStatusFilter("Completed");
    useTrackRankerStore.getState().setConfidenceTypeFilter("Acceleration");
    const persisted = localStorage.getItem("trackranker-workspace");

    useTrackRankerStore.setState(trackRankerInitialState);
    localStorage.setItem("trackranker-workspace", persisted!);
    await useTrackRankerStore.persist.rehydrate();

    expect(useTrackRankerStore.getState()).toMatchObject({
      sessionDraft: draft,
      sessionTypeFilter: "Tempo",
      sessionStatusFilter: "Completed",
      confidenceTypeFilter: "Acceleration",
    });
  });

  it("falls back safely when persisted values are invalid", async () => {
    localStorage.setItem(
      "trackranker-workspace",
      JSON.stringify({
        state: {
          sessionDraft: { prescription: 42 },
          sessionTypeFilter: "UnknownType",
          sessionStatusFilter: "Archived",
          confidenceTypeFilter: "UnknownType",
        },
        version: 1,
      }),
    );

    await useTrackRankerStore.persist.rehydrate();

    expect(useTrackRankerStore.getState()).toMatchObject(trackRankerInitialState);
  });
});
