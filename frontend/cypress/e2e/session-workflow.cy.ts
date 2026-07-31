describe("training session workflow", () => {
  beforeEach(() => {
    cy.resetE2eData();
  });

  it("creates a realistic session through the athlete interface", () => {
    cy.contains("a", "Log a session").click();

    cy.contains("label", "Session type").find("select").select("SpeedEndurance");
    cy.contains("label", "Date").find("input").type("2026-08-01");
    cy.contains("label", "What's the session?").find("textarea")
      .type("3 × 150m, 10 min rest");
    cy.contains("label", "Planned intensity").find("input").type("95");
    cy.contains("button", "Add more clarity").click();
    cy.contains("label", "Purpose").find("textarea")
      .type("Maintain high sprint speed as fatigue increases.");
    cy.contains("label", "Focus cue").find("textarea")
      .type("Stay relaxed and maintain rhythm.");
    cy.contains("label", "Success criteria").find("textarea")
      .type("Complete each repetition with controlled technique.");

    cy.contains("button", "Create session").click();

    cy.location("pathname").should("match", /^\/sessions\/[a-f0-9]{24}$/);
    cy.contains("h2", "Prescription").parent()
      .should("contain.text", "3 × 150m, 10 min rest");
    cy.get(".detail-meta").should("contain.text", "Planned");
    cy.contains("h2", "Why you're doing it").parent()
      .should("contain.text", "Maintain high sprint speed as fatigue increases.");
    cy.contains("h2", "Focus").parent()
      .should("contain.text", "Stay relaxed and maintain rhythm.");
    cy.contains("h2", "What success looks like").parent()
      .should("contain.text", "Complete each repetition with controlled technique.");

    cy.get("nav[aria-label='Primary navigation']").contains("a", "Sessions").click();
    cy.contains("3 × 150m, 10 min rest").should("be.visible");
    cy.contains("Speed Endurance").should("be.visible");
  });

  it("logs a completed outcome, reflection, confidence, and immediate progress", () => {
    cy.createPlannedSession().then((session) => {
      cy.visit(`/sessions/${session.id}`);
    });
    cy.contains("a", "Log completed session").click();

    cy.contains("label", "Actual intensity").find("select").select("8");
    cy.contains("label", "Perceived difficulty").find("select").select("7");
    cy.contains("button", "Add repetition").click();
    cy.get("input[aria-label='Distance for repetition 1']").type("150");
    cy.get("input[aria-label='Time for repetition 1']").type("17.5");
    cy.get("input[aria-label='Notes for repetition 1']")
      .type("Relaxed through the line.");
    cy.contains("label", "What went well?").find("textarea")
      .type("Stayed relaxed through the final section.");
    cy.contains("label", "What improved today?").find("textarea")
      .type("Maintained rhythm better than expected.");
    cy.contains("label", "What do you want to focus on next time?").find("textarea")
      .type("Keep shoulders relaxed.");
    cy.contains("label", "Coach feedback").find("textarea").type("Good rhythm.");
    cy.contains("label", "Confidence before the session").find("select").select("3");
    cy.contains("label", "Confidence after the session").find("select").select("4");

    cy.intercept("POST", "**/api/training-sessions/*/completion").as("saveCompletion");
    cy.contains("button", "Log completed session").click();
    cy.wait("@saveCompletion").its("response.statusCode").should("equal", 201);

    cy.contains("h2", "Progress earned").should("be.visible");
    cy.contains("+35 XP").should("be.visible");
    cy.get(".detail-meta").should("contain.text", "Completed");
    cy.contains("17.5s").should("be.visible");
    cy.contains("Stayed relaxed through the final section.").should("be.visible");
    cy.contains("Maintained rhythm better than expected.").should("be.visible");
    cy.contains("dt", "Confidence before").parent().should("contain.text", "3");
    cy.contains("dt", "Confidence after").parent().should("contain.text", "4");
  });
});
