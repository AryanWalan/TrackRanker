import "@testing-library/jest-dom/vitest";
import {
  trackRankerInitialState,
  useTrackRankerStore,
} from "../stores/useTrackRankerStore";

beforeEach(() => {
  localStorage.clear();
  useTrackRankerStore.setState(trackRankerInitialState);
});

afterEach(() => {
  vi.restoreAllMocks();
});
