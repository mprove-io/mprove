const { defineConfig } = require('cypress');

module.exports = defineConfig({
  retries: {
    runMode: 2,
    openMode: 0
  },
  viewportWidth: 1440,
  viewportHeight: 1000,
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
    setupNodeEvents(on, config) {},
    specPattern: './src/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: './src/support/index.ts'
  }
});
