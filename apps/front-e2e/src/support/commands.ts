import { apiToBackend } from '~front-e2e/barrels/api-to-backend';
import { common } from '~front-e2e/barrels/common';
import { constants } from '~front-e2e/barrels/constants';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject> {
      deletePack(pack: apiToBackend.ToBackendDeleteRecordsRequestPayload): void;
      seedPack(pack: apiToBackend.ToBackendSeedRecordsRequestPayload): void;
      loginUser(item: apiToBackend.ToBackendLoginUserRequestPayload): void;
      loading(): void;
      loadingExist(): void;
      loadingNotExist(): void;
    }
  }
}

Cypress.Commands.add(
  'deletePack',
  (pack: apiToBackend.ToBackendDeleteRecordsRequestPayload) => {
    let body: apiToBackend.ToBackendDeleteRecordsRequest = {
      info: {
        idempotencyKey: common.makeId(),
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteRecords,
        traceId: common.makeId()
      },
      payload: pack
    };

    cy.request({
      url:
        'localhost:3000/api/' +
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteRecords,
      method: constants.POST,
      body: body
    });
  }
);

Cypress.Commands.add(
  'seedPack',
  (pack: apiToBackend.ToBackendSeedRecordsRequestPayload) => {
    let body: apiToBackend.ToBackendSeedRecordsRequest = {
      info: {
        idempotencyKey: common.makeId(),
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSeedRecords,
        traceId: common.makeId()
      },
      payload: pack
    };

    cy.request({
      url:
        'localhost:3000/api/' +
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSeedRecords,
      method: constants.POST,
      body: body
    });
  }
);

Cypress.Commands.add(
  'loginUser',
  (item: apiToBackend.ToBackendLoginUserRequestPayload) => {
    let body: apiToBackend.ToBackendLoginUserRequest = {
      info: {
        idempotencyKey: common.makeId(),
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
        traceId: common.makeId()
      },
      payload: item
    };

    cy.request({
      url:
        'localhost:3000/api/' +
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
      method: constants.POST,
      body: body
    }).then(resp => {
      let payload: apiToBackend.ToBackendLoginUserResponsePayload =
        resp.body.payload;

      window.localStorage.setItem('token', payload.token);
    });
  }
);

Cypress.Commands.add('loading', () => {
  cy.get('[data-cy=loadingSpinner]', { timeout: 10000 }).should('exist');
  cy.get('[data-cy=loadingSpinner]', { timeout: 10000 }).should('not.exist');
});

Cypress.Commands.add('loadingExist', () => {
  cy.get('[data-cy=loadingSpinner]', { timeout: 10000 }).should('exist');
});

Cypress.Commands.add('loadingNotExist', () => {
  cy.get('[data-cy=loadingSpinner]', { timeout: 10000 }).should('not.exist');
});

//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => {
//   console.log('Custom command example: Login', email, password);
// });
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
