import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '3-2-user@example.com';
const password = '123123';

describe('3-2 login-success (logged out, existing user, valid password, email verified)', () => {
  it(`should be able to login, redirect to ${constants.PATH_PROFILE}`, () => {
    cy.deletePack({
      user_ids: [userId]
    });
    cy.seedPack({
      users: [
        {
          user_id: userId,
          password: password,
          email_verified: true
        }
      ]
    });
    cy.basicVisit(constants.PATH_LOGIN);
    cy.get('[data-cy=loginEmailInput]').type(userId);
    cy.get('[data-cy=loginPasswordInput]').type(password);
    cy.get('[data-cy=loginSignInButton]').click();
    cy.url().should('include', constants.PATH_PROFILE);
    cy.noLoading();
  });
});
