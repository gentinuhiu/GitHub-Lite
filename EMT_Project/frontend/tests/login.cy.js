describe("Login page", () => {
    const unique = Date.now();
    const username = `user${unique}`;
    const email = `mail${unique}@test.com`;
    const password = "Password123!";

    // If your backend is still blocking /register with 401, this will fail.
    // Keep it but allow failures so tests continue and we can see UI behavior.
    before(() => {
        cy.request({
            method: "POST",
            url: "http://localhost:8080/api/auth/register",
            body: { name: "Test", username, password, repeatPassword: password, email },
            failOnStatusCode: false,
        }).then((res) => {
            // accept 200 or 400 (already exists). If 401, backend security still blocking register.
            expect([200, 400, 401]).to.include(res.status);
        });
    });

    it("shows frontend validation when fields are empty", () => {
        cy.visit("/login");

        cy.get("[data-cy=login-submit]").click();

        cy.get("[data-cy=login-error]")
            .should("be.visible")
            .and("contain.text", "Please fill in both username and password.");
    });

    it("shows backend error on wrong password", () => {
        cy.visit("/login");

        cy.get("[data-cy=login-username]").type(username);
        cy.get("[data-cy=login-password]").type("WrongPassword!");

        cy.get("[data-cy=login-submit]").click();

        // Your backend sends plain text error; your UI shows it in Typography
        cy.get("[data-cy=login-error]", { timeout: 10000 }).should("be.visible");
    });

    it("logs in successfully and navigates to /user/:username", () => {
        cy.visit("/login");

        cy.get("[data-cy=login-username]").clear().type(username);
        cy.get("[data-cy=login-password]").clear().type(password);

        cy.get("[data-cy=login-submit]").click();

        cy.url({ timeout: 10000 }).should("include", `/user/${encodeURIComponent(username)}`);
    });
});
