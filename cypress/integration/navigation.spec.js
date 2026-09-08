describe("Navigation", () => {
  it("should visit root", () => {
    cy.visit("/");
    cy.loginDemo();
  });

  it("should navigate to Tuesday", () => {
    cy.visit("/");
    cy.loginDemo();
    cy.contains("li", "Tuesday")
      .click()
      .should("have.class", "day-list__item--selected");
  });
});
