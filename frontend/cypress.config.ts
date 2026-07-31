import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
  },
  env: {
    apiUrl: process.env.CYPRESS_API_URL ?? "http://localhost:5000",
  },
  retries: 0,
  video: false,
});
