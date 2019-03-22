import './commands';

require('cypress-failed-log');
require('cypress-plugin-retries');

Cypress.Server.defaults({
  whitelist: xhr => {
    return xhr.method === 'POST' && /pong$/.test(xhr.url);
  }
});
