interface SeededTrainingSession {
  id: string;
  title: string;
  sessionDate: string;
  prescription: string;
  status: "Planned" | "Completed" | "Cancelled";
}

const plannedSession = {
  title: "Speed Endurance Evidence",
  sessionType: "SpeedEndurance",
  sessionDate: "2025-02-15",
  prescription: "3 × 150m, 10 min rest",
  purpose: "Maintain high sprint speed as fatigue increases.",
  focusCue: "Stay relaxed and maintain rhythm.",
  successCriteria: "Complete each repetition with controlled technique.",
  intendedIntensity: 95,
  coachNotes: "Good rhythm.",
  status: "Planned",
};

const completedOutcome = {
  actualIntensity: 8,
  perceivedDifficulty: 7,
  repetitionResults: [
    {
      setNumber: 1,
      repetitionNumber: 1,
      distanceMetres: 150,
      timeSeconds: 17.5,
      notes: "Relaxed through the line.",
    },
  ],
  reflection: {
    wentWell: "Stayed relaxed through the final section.",
    improved: "Maintained rhythm better than expected.",
    wasDifficult: "Holding posture in the final metres.",
    nextFocus: "Keep shoulders relaxed.",
    coachFeedback: "Good rhythm.",
    confidenceBefore: 3,
    confidenceAfter: 4,
  },
};

Cypress.Commands.add("resetE2eData", () => {
  return cy.env(["apiUrl"]).then(({ apiUrl }) => {
    cy.request({
      method: "POST",
      url: `${apiUrl}/api/testing/reset`,
    }).its("status").should("equal", 204);

    cy.visit("/", {
      onBeforeLoad(window) {
        window.localStorage.removeItem("trackranker-workspace");
      },
    });
  });
});

Cypress.Commands.add("createPlannedSession", () => {
  return cy.env(["apiUrl"]).then(({ apiUrl }) => {
    return cy.request<SeededTrainingSession>({
      method: "POST",
      url: `${apiUrl}/api/training-sessions`,
      body: plannedSession,
    }).then((response) => {
      expect(response.status).to.equal(201);
      return response.body;
    });
  });
});

Cypress.Commands.add("createCompletedSession", () => {
  return cy.createPlannedSession().then((session) => {
    return cy.env(["apiUrl"]).then(({ apiUrl }) => {
      return cy.request({
        method: "POST",
        url: `${apiUrl}/api/training-sessions/${session.id}/completion`,
        body: completedOutcome,
      }).then((response) => {
        expect(response.status).to.equal(201);
        return session;
      });
    });
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      resetE2eData(): Chainable<void>;
      createPlannedSession(): Chainable<SeededTrainingSession>;
      createCompletedSession(): Chainable<SeededTrainingSession>;
    }
  }
}

export {};
