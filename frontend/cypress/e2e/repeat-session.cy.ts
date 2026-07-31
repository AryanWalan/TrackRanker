describe("repeat session", () => {
  beforeEach(() => {
    cy.resetE2eData();
  });

  it("copies the plan into a new session without copying its outcome", () => {
    cy.createCompletedSession().then((original) => {
      cy.visit(`/sessions/${original.id}`);
      cy.contains("a", "Repeat session").click();

      cy.contains("label", "Session type").find("select")
        .should("have.value", "SpeedEndurance");
      cy.contains("label", "What's the session?").find("textarea")
        .should("have.value", original.prescription)
        .clear()
        .type("4 × 120m, 8 min rest");
      cy.contains("label", "Purpose").find("textarea")
        .should("have.value", "Maintain high sprint speed as fatigue increases.");
      cy.contains("label", "Focus cue").find("textarea")
        .should("have.value", "Stay relaxed and maintain rhythm.");
      cy.contains("label", "Date").find("input")
        .should("not.have.value", original.sessionDate);
      cy.contains("label", "Status").find("select").should("have.value", "Planned");

      cy.contains("button", "Create session").click();
      cy.location("pathname").should("match", /^\/sessions\/[a-f0-9]{24}$/);
      cy.location("pathname").should("not.equal", `/sessions/${original.id}`);
      cy.get(".detail-meta").should("contain.text", "Planned");
      cy.contains("4 × 120m, 8 min rest").should("be.visible");
      cy.contains("You haven't logged the outcome of this session yet.").should("be.visible");

      cy.env(["apiUrl"]).then(({ apiUrl }) => {
        cy.request(`${apiUrl}/api/training-sessions/${original.id}`)
          .its("body")
          .should("include", {
            prescription: "3 × 150m, 10 min rest",
            status: "Completed",
          });
      });
    });
  });
});
