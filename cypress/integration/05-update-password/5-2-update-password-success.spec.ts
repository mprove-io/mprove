import * as constants from '../../../src/app/constants/_index';

const userId = '5-2-user@example.com';
const password = '123123';
const userPasswordResetToken = 'abcdef';
const newPassword = '456456';

describe('5-2 update-password-success (logged out)', () => {
  it(`should be able to set new password, redirect to ${
    constants.PATH_LOGIN
  }`, () => {
    cy.deletePack({ user_ids: [userId] });
    cy.seedPack({
      users: [
        {
          user_id: userId,
          password: password,
          email_verified: false,
          password_reset_token: userPasswordResetToken
        }
      ]
    });
    cy.basicVisit(
      constants.PATH_UPDATE_PASSWORD + '?token=' + userPasswordResetToken
    );
    cy.get('[data-cy=updatePasswordNewPasswordInput]').type(newPassword);
    cy.get('[data-cy=updatePasswordConfirmPasswordInput]').type(newPassword);
    cy.get('[data-cy=updatePasswordSetPasswordButton]').click();
    cy.loading();
    cy.url().should('include', constants.PATH_LOGIN);
    cy.get('[data-cy=dialogInfoMessage]').should('contain', 'New Password was set');
  });
});
