describe("Register page", () => {
    const unique = Date.now();

    it("registers successfully and redirects to /login", () => {
        cy.visit("/register");

        cy.contains("Register").should("be.visible");

        cy.get('input[name="name"]').type("Test");
        cy.get('input[name="username"]').type(`user${unique}`);
        cy.get('input[name="password"]').type("Password123!");
        cy.get('input[name="repeatPassword"]').type("Password123!");
        cy.get('input[name="email"]').type(`mail${unique}@test.com`);

        cy.contains("button", "Register").click();

        // Your Register component does: navigate("/login")
        cy.url().should("include", "/login");
    });

    it("shows frontend error if required fields are missing", () => {
        cy.visit("/register");
        cy.contains("button", "Register").click();

        cy.contains("Please fill in all required fields.").should("be.visible");
    });

    it("shows frontend error if passwords do not match", () => {
        cy.visit("/register");

        cy.get('input[name="name"]').type("Test");
        cy.get('input[name="username"]').type(`userX${unique}`);
        cy.get('input[name="password"]').type("Password123!");
        cy.get('input[name="repeatPassword"]').type("Password999!");
        cy.get('input[name="email"]').type(`mailX${unique}@test.com`);

        cy.contains("button", "Register").click();

        cy.contains("Passwords do not match.").should("be.visible");
    });

    it("shows backend error message (example: invalid username)", () => {
        cy.visit("/register");

        cy.get('input[name="name"]').type("Test");
        cy.get('input[name="username"]').type(`user_${unique}`); // invalid (underscore)
        cy.get('input[name="password"]').type("Password123!");
        cy.get('input[name="repeatPassword"]').type("Password123!");
        cy.get('input[name="email"]').type(`mail_bad${unique}@test.com`);

        cy.contains("button", "Register").click();

        // backend error is returned as plain text and rendered directly
        cy.contains("Username should be made up of letters and numbers only").should("be.visible");
    });
});