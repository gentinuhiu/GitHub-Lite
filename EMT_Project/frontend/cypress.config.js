import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        baseUrl: "http://localhost:3000",
        specPattern: "tests/*.cy.js",
        viewportWidth: 1280,
        viewportHeight: 720,
    },
});
