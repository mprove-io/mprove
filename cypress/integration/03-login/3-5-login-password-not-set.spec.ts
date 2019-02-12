import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '3-5-user@example.com';
const error = api.ServerResponseStatusEnum.LOGIN_ERROR_REGISTER_TO_SET_PASSWORD;

describe('3-5 login-password-not-set (logged out, existing user)', () => {
  it(`should see ${error}`, () => {
    cy.deletePack({
      user_ids: [userId]
    });
    cy.seedPack({
      users: [
        {
          user_id: userId,
          password: undefined,
          email_verified: false
        }
      ]
    });
    cy.basicVisit(constants.PATH_LOGIN);
    cy.get('[data-cy=loginEmailInput]').type(userId);
    cy.get('[data-cy=loginPasswordInput]').type('789789');
    cy.get('[data-cy=loginSignInButton]').click();
    cy.loading();
    cy.get('[data-cy=dialogInfoMessage]').should('contain', error);
  });
});
