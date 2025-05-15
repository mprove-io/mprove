const { defineConfig } = require('cypress');

module.exports = defineConfig({
  retries: {
    runMode: 2,
    openMode: 0
  },
  viewportWidth: 2560, // 3840 2560
  viewportHeight: 1220, // 2160 1294 1220
  fileServerFolder: '.',
  fixturesFolder: './src/fixtures',
  modifyObstructiveCode: false,
  video: false,
  videosFolder: '../../dist/cypress/apps/integra/videos',
  screenshotsFolder: '../../dist/cypress/apps/integra/screenshots',
  chromeWebSecurity: false,
  env: {
    tsConfig: 'tsconfig.e2e.json'
  },
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: './src/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: './src/support/index.ts',
    setupNodeEvents(on, config) {}
  }
});
