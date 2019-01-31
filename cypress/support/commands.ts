import * as api from '../../src/app/api/_index';
import * as uuid from 'uuid';

declare global {
  // tslint:disable-next-line:no-namespace
  namespace Cypress {
    interface Chainable {
      deletePack: typeof deletePack;
      seedPack: typeof seedPack;
      loginUser: typeof loginUser;
      basicVisit: typeof basicVisit;
      noLoading: typeof noLoading;
    }
  }
}

export function deletePack(pack: api.CypressDeleteRequestBody['payload']) {
  cy.request({
    url: 'api/v1' + api.PATH_CYPRESS_DELETE,
    method: 'POST',
    body: {
      payload: pack
    }
  });
}

export function seedPack(pack: api.CypressSeedRequestBody['payload']) {
  cy.request({
    url: 'api/v1' + api.PATH_CYPRESS_SEED,
    method: 'POST',
    body: {
      payload: pack
    }
  });
}

export function loginUser(item: { user_id: string; password: string }) {
  cy.request({
    url: 'api/v1' + api.PATH_LOGIN_USER,
    method: 'POST',
    body: {
      info: {
        init_id: null,
        origin: api.CommunicationOriginEnum.CLIENT,
        request_id: uuid.v4(),
        type: api.CommunicationTypeEnum.REQUEST
      },
      payload: {
        user_id: item.user_id,
        password: item.password
      }
    }
  }).then(resp => {
    let payload: api.LoginUserResponse200BodyPayload = resp.body.payload;
    window.localStorage.setItem('token', payload.token);
  });
}

export function basicVisit(url: string) {
  cy.visit(url, {
    auth: {
      username: Cypress.env('basic_login'),
      password: Cypress.env('basic_pass')
    },
    // onBeforeLoad: contentWindow => {}
  });
}

export function noLoading() {
  cy.get('cdk-overlay-container').should('not.exist');
}

Cypress.Commands.add('deletePack', deletePack);
Cypress.Commands.add('seedPack', seedPack);
Cypress.Commands.add('loginUser', loginUser);
Cypress.Commands.add('basicVisit', basicVisit);
Cypress.Commands.add('noLoading', noLoading);
