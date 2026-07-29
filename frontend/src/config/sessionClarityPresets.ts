import type { SessionType } from "../types/trainingSession";

export interface SessionClarityPreset {
  purpose: string;
  focusCue: string;
  successCriteria: string;
}

export const sessionClarityPresets: Partial<Record<SessionType, SessionClarityPreset>> = {
  Acceleration: {
    purpose: "Improve the first phase of the sprint and build speed efficiently.",
    focusCue: "Push strongly, stay patient and build your body position gradually.",
    successCriteria: "Consistent accelerations with controlled technique.",
  },
  MaxVelocity: {
    purpose: "Develop upright sprinting speed and efficient mechanics.",
    focusCue: "Run tall, relaxed and strike underneath the body.",
    successCriteria: "Fast, relaxed repetitions without excessive tension.",
  },
  SpeedEndurance: {
    purpose: "Maintain high sprint speed as fatigue begins to increase.",
    focusCue: "Stay relaxed and maintain rhythm throughout the repetition.",
    successCriteria:
      "Complete the planned repetitions without a major breakdown in technique.",
  },
  Tempo: {
    purpose: "Build general conditioning while keeping the running controlled.",
    focusCue: "Stay relaxed and maintain consistent rhythm.",
    successCriteria: "Complete the planned volume at controlled effort.",
  },
  Competition: {
    purpose: "Execute the planned race strategy and technical cues.",
    focusCue: "Commit to the race plan and stay composed.",
    successCriteria: "Judge the performance by execution as well as the final time.",
  },
};
