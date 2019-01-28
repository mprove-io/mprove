import * as api from '../../src/app/api/_index';

declare global {
  // tslint:disable-next-line:no-namespace
  namespace Cypress {
    interface Chainable {
      basicVisit: typeof basicVisit;
      deletePack: typeof deletePack;
    }
  }
}

export function basicVisit(url: string) {
  cy.visit(url, {
    auth: {
      username: Cypress.env('basic_login'),
      password: Cypress.env('basic_pass')
    }
  });
}

export function deletePack(pack: api.CypressDeleteRequestBody['payload']) {
  cy.request({
    url: 'http://localhost:8080/api/v1' + api.PATH_CYPRESS_DELETE,
    method: 'POST',
    body: {
      payload: pack
    }
  });
}

Cypress.Commands.add('basicVisit', basicVisit);
Cypress.Commands.add('deletePack', deletePack);
