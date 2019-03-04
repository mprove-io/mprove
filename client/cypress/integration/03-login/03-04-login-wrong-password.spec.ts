import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '03-04-user@example.com';
const password = '123123';
const error = api.ServerResponseStatusEnum.LOGIN_ERROR_WRONG_PASSWORD;

describe('03-04 login-wrong-password (logged out, existing user)', () => {
  it(`should see ${error}`, () => {
    cy.deletePack({
      user_ids: [userId]
    });
    cy.seedPack({
      users: [
        {
          user_id: userId,
          password: password,
          email_verified: false
        }
      ]
    });
    cy.basicVisit(constants.PATH_LOGIN);
    cy.get('[data-cy=loginEmailInput]').type(userId);
    cy.get('[data-cy=loginPasswordInput]').type('456456');
    cy.get('[data-cy=loginSignInButton]').click();
    cy.loading();
    cy.get('[data-cy=dialogInfoMessage]').should('contain', error);
  });
});
