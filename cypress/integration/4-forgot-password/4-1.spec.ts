import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '4-1-user@example.com';
const password = '123123';

describe('4-1 (forgot-password) logged out, existing user', () => {
  it(`should redirect to ${constants.PATH_RESET_PASSWORD_SENT}`, () => {
    cy.deletePack({ user_ids: [userId] });
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
    cy.get('[data-cy=forgotPasswordButton]').click();
    cy.get('[data-cy=resetPasswordEmailInput]').type(userId);
    cy.get('[data-cy=resetPasswordSendButton]').click();
    cy.url().should('include', constants.PATH_RESET_PASSWORD_SENT);
    cy.noLoading();
  });
});
