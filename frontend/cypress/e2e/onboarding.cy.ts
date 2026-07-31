describe("first-time navigation", () => {
  beforeEach(() => {
    cy.resetE2eData();
  });

  it("explains TrackRanker and reaches the session form", () => {
    cy.get("h1").should("have.text", "TrackRanker");
    cy.contains("For 100m, 200m and 400m sprinters").should("be.visible");
    cy.contains("h2", "How TrackRanker works").should("be.visible");
    cy.contains("h3", "Log your session").should("be.visible");
    cy.contains("h3", "Complete and reflect").should("be.visible");
    cy.contains("h3", "Build confidence").should("be.visible");

    cy.get("nav[aria-label='Primary navigation']").within(() => {
      for (const label of ["Dashboard", "Sessions", "Confidence", "Progress"]) {
        cy.contains("a", label).should("be.visible");
      }
      cy.contains("a", "Profile").should("not.exist");
    });

    cy.get("nav[aria-label='Dashboard quick actions']").within(() => {
      cy.contains("a", "Training history").should("be.visible");
      cy.contains("a", "Log a session").click();
    });

    cy.location("pathname").should("equal", "/sessions/new");
    cy.contains("h1", "Log a session").should("be.visible");
  });
});
