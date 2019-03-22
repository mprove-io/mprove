import * as constants from '../../../src/app/constants/_index';

const userId = '03-03-user@example.com';
const password = '123123';

describe('03-03 login-verify-email (logged out, existing user, valid password)', () => {
  it(`should be able to login, redirect to ${
    constants.PATH_VERIFY_EMAIL_SENT
  }`, () => {
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
    cy.get('[data-cy=loginPasswordInput]').type(password);
    cy.get('[data-cy=loginSignInButton]').click();
    cy.loading();
    cy.url().should('include', constants.PATH_VERIFY_EMAIL_SENT);
  });
});
