describe("Password Reset Flow (Forgot + Reset)", () => {
    const unique = Date.now();
    const username = `pwuser${unique}`;
    const email = `pw${unique}@test.com`;
    const password = "Password123!";
    const newPassword = "NewPassword123!";

    let token = "";

    before(() => {
        cy.request({
            method: "POST",
            url: "http://localhost:8080/api/auth/register",
            body: { name: "Test", username, password, repeatPassword: password, email },
            failOnStatusCode: false,
        }).then((res) => expect([200, 400]).to.include(res.status));

        cy.request({
            method: "POST",
            url: "http://localhost:8080/api/auth/forgot-password",
            body: { email },
            failOnStatusCode: false,
        }).then((res) => expect([200, 400]).to.include(res.status));

        cy.request({
            method: "GET",
            url: `http://localhost:8080/api/test/token?email=${encodeURIComponent(email)}`,
        }).then((res) => {
            token = (res.body || "").toString().trim();
            expect(token).to.not.eq("");
        });
    });

    it("Forgot Password: shows error when email is empty", () => {
        cy.visit("/forgot-password");

        cy.get("#fp-submit").click();

        // Assert the actual message, not just element existence
        cy.contains("Please enter your email", { timeout: 8000 }).should("be.visible");
    });

    it("Forgot Password: success disables input and button", () => {
        cy.visit("/forgot-password");

        cy.get('input[name="email"]').clear().type(email);
        cy.get("#fp-submit").click();

        cy.get("#fp-success", { timeout: 10000 })
            .should("be.visible")
            .and("contain.text", "Email has been sent to your account");

        cy.get('input[name="email"]').should("be.disabled");
        cy.get("#fp-submit").should("be.disabled");
    });

    it("Forgot Password: Back to Login navigates to /login", () => {
        cy.visit("/forgot-password");
        cy.get("#fp-back").click();
        cy.url().should("include", "/login");
    });

    it("Reset Password: shows error when fields empty", () => {
        cy.visit(`/reset-password?token=${encodeURIComponent(token)}`);

        cy.get("#rp-submit").click();

        // Assert message text
        cy.contains("Please fill in all fields.", { timeout: 8000 }).should("be.visible");
    });

    it("Reset Password: shows error when passwords do not match", () => {
        cy.visit(`/reset-password?token=${encodeURIComponent(token)}`);

        cy.get("#rp-password").clear().type("NewPassword123!");
        cy.get("#rp-repeat").clear().type("DifferentPassword123!");

        cy.get("#rp-submit").click();
        cy.get("#rp-error").should("be.visible").and("contain.text", "Passwords do not match.");
    });

    it("Reset Password: success resets password with valid token", () => {
        // ✅ IMPORTANT: request a NEW token right before reset success
        cy.request("POST", "http://localhost:8080/api/auth/forgot-password", { email })
            .its("status")
            .should("eq", 200);

        cy.request("GET", `http://localhost:8080/api/test/token?email=${encodeURIComponent(email)}`)
            .then((res) => {
                const freshToken = (res.body || "").toString().trim();
                expect(freshToken).to.not.eq("");

                cy.visit(`/reset-password?token=${encodeURIComponent(freshToken)}`);

                cy.get("#rp-password").clear().type(newPassword);
                cy.get("#rp-repeat").clear().type(newPassword);

                cy.get("#rp-submit").click();

                // Assert success message text
                cy.contains("Your password has been reset", { timeout: 10000 }).should("be.visible");
            });
    });

    it("Reset Password: invalid token shows backend error", () => {
        cy.visit(`/reset-password?token=invalid-token`);

        cy.get("#rp-password").clear().type(newPassword);
        cy.get("#rp-repeat").clear().type(newPassword);

        cy.get("#rp-submit").click();

        cy.get("#rp-success").should("not.exist");
        cy.get("#rp-error", { timeout: 10000 }).should("be.visible");
    });
});
