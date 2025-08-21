import { INTEGRA_POST } from '~common/constants/top';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import {
  ToBackendDeleteRecordsRequest,
  ToBackendDeleteRecordsRequestPayload
} from '~common/interfaces/to-backend/test-routes/to-backend-delete-records';
import {
  ToBackendSeedRecordsRequest,
  ToBackendSeedRecordsRequestPayload
} from '~common/interfaces/to-backend/test-routes/to-backend-seed-records';
import {
  ToBackendLoginUserRequest,
  ToBackendLoginUserRequestPayload,
  ToBackendLoginUserResponsePayload
} from '~common/interfaces/to-backend/users/to-backend-login-user';

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      deletePack(pack: ToBackendDeleteRecordsRequestPayload): void;
      seedPack(pack: ToBackendSeedRecordsRequestPayload): void;
      loginUser(item: ToBackendLoginUserRequestPayload): void;
      loading(): void;
      loadingExist(): void;
      loadingNotExist(): void;
    }
  }
}

Cypress.Commands.add(
  'deletePack',
  (pack: ToBackendDeleteRecordsRequestPayload) => {
    let body: ToBackendDeleteRecordsRequest = {
      info: {
        idempotencyKey: makeId(),
        name: ToBackendRequestInfoNameEnum.ToBackendDeleteRecords,
        traceId: makeId()
      },
      payload: pack
    };

    cy.request({
      url:
        'http://backend:3000/' +
        // + commonConstants.API_PATH + '/'
        ToBackendRequestInfoNameEnum.ToBackendDeleteRecords,
      method: INTEGRA_POST,
      body: body
    });
  }
);

Cypress.Commands.add('seedPack', (pack: ToBackendSeedRecordsRequestPayload) => {
  let body: ToBackendSeedRecordsRequest = {
    info: {
      idempotencyKey: makeId(),
      name: ToBackendRequestInfoNameEnum.ToBackendSeedRecords,
      traceId: makeId()
    },
    payload: pack
  };

  cy.request({
    url:
      'http://backend:3000/' +
      // + commonConstants.API_PATH + '/'
      ToBackendRequestInfoNameEnum.ToBackendSeedRecords,
    method: INTEGRA_POST,
    body: body
  });
});

Cypress.Commands.add('loginUser', (item: ToBackendLoginUserRequestPayload) => {
  let body: ToBackendLoginUserRequest = {
    info: {
      idempotencyKey: makeId(),
      name: ToBackendRequestInfoNameEnum.ToBackendLoginUser,
      traceId: makeId()
    },
    payload: item
  };

  cy.request({
    url:
      'http://backend:3000/' +
      // + commonConstants.API_PATH + '/'
      ToBackendRequestInfoNameEnum.ToBackendLoginUser,
    method: INTEGRA_POST,
    body: body
  }).then(resp => {
    let payload: ToBackendLoginUserResponsePayload = resp.body.payload;

    window.localStorage.setItem('token', payload.token);
  });
});

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
