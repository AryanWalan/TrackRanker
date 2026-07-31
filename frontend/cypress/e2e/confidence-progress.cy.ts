describe("confidence evidence and TrackRank progress", () => {
  beforeEach(() => {
    cy.resetE2eData();
  });

  it("shows evidence from a real completed session and links back to it", () => {
    cy.createCompletedSession().then((session) => {
      cy.visit("/confidence");
      cy.contains("h1", "Your Confidence Evidence").should("be.visible");
      cy.contains("h3", session.title).should("be.visible");
      cy.contains("3 / 5").should("be.visible");
      cy.contains("4 / 5").should("be.visible");
      cy.contains("Stayed relaxed through the final section.").should("be.visible");
      cy.contains("Maintained rhythm better than expected.").should("be.visible");
      cy.contains("Keep shoulders relaxed.").should("be.visible");
      cy.contains("a", "View session").click();
      cy.location("pathname").should("equal", `/sessions/${session.id}`);
      cy.contains("h1", session.title).should("be.visible");
    });
  });

  it("calculates deterministic process XP and unlocks first achievements", () => {
    cy.createCompletedSession();
    cy.visit("/progress");

    cy.contains("h1", "Your TrackRank").should("be.visible");
    cy.contains("35 XP").should("be.visible");
    cy.contains("dt", "Completed sessions").parent().should("contain.text", "1");
    cy.contains("dt", "Reflections").parent().should("contain.text", "1");
    cy.contains("dt", "Confidence check-ins").parent().should("contain.text", "1");
    cy.contains(".achievement-card", "First Finish").should("contain.text", "Unlocked");
    cy.contains(".achievement-card", "Reflective Start").should("contain.text", "Unlocked");
  });
});
