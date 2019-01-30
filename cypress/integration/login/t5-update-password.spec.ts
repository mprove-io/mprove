import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = 't5-user@example.com';
const userPassword = '123123';
const userPasswordResetToken = 'abcdef';
const newPassword = '456456';

function resetData() {
  cy.deletePack({ user_ids: [userId] });
  cy.seedPack({
    users: [
      {
        user_id: userId,
        password: userPassword,
        email_verified: false,
        password_reset_token: userPasswordResetToken
      }
    ]
  });
}

describe('t5-update-password', () => {
  afterEach(() => {
    cy.noLoading();
  });

  const mainHeading = 'Set New Password';

  it(`should display heading "${mainHeading}"`, () => {
    cy.basicVisit(constants.PATH_UPDATE_PASSWORD);
    cy.get('h3').should('contain', mainHeading);
  });

  it(`good token - should be able to set new password, redirect to ${
    constants.PATH_LOGIN
  }`, () => {
    resetData();
    cy.basicVisit(
      constants.PATH_UPDATE_PASSWORD + '?token=' + userPasswordResetToken
    );
    cy.get('[data-cy=updatePasswordNewPasswordInput]').type(newPassword);
    cy.get('[data-cy=updatePasswordConfirmPasswordInput]').type(newPassword);
    cy.get('[data-cy=updatePasswordSetPasswordButton]').click();
    cy.url().should('include', constants.PATH_LOGIN);
    cy.get('[data-cy=message]').should('contain', 'New Password was set');
  });

  it(`bad token - should see ${
    api.ServerResponseStatusEnum.UPDATE_PASSWORD_ERROR_TOKEN_EXPIRED
  }, redirect to ${constants.PATH_LOGIN}`, () => {
    cy.basicVisit(constants.PATH_UPDATE_PASSWORD + '?token=notExistingToken');
    cy.get('[data-cy=updatePasswordNewPasswordInput]').type(newPassword);
    cy.get('[data-cy=updatePasswordConfirmPasswordInput]').type(newPassword);
    cy.get('[data-cy=updatePasswordSetPasswordButton]').click();
    cy.url().should('include', constants.PATH_LOGIN);
    cy.get('[data-cy=message]').should(
      'contain',
      api.ServerResponseStatusEnum.UPDATE_PASSWORD_ERROR_TOKEN_EXPIRED
    );
  });
});
