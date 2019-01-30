import * as api from '../../src/app/api/_index';

declare global {
  // tslint:disable-next-line:no-namespace
  namespace Cypress {
    interface Chainable {
      basicVisit: typeof basicVisit;
      noLoading: typeof noLoading;
      deletePack: typeof deletePack;
      seedPack: typeof seedPack;
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

export function noLoading() {
  cy.get('cdk-overlay-container').should('not.exist');
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

export function seedPack(pack: api.CypressSeedRequestBody['payload']) {
  cy.request({
    url: 'http://localhost:8080/api/v1' + api.PATH_CYPRESS_SEED,
    method: 'POST',
    body: {
      payload: pack
    }
  });
}

Cypress.Commands.add('basicVisit', basicVisit);
Cypress.Commands.add('deletePack', deletePack);
Cypress.Commands.add('seedPack', seedPack);
Cypress.Commands.add('noLoading', noLoading);
