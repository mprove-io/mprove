import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const existingUserId = '1-4-existing-user@example.com';
const notExistingUserId = '1-4-not-existing-user@example.com';
const newPassword = '123123';

function resetData() {
  cy.deletePack({ user_ids: [existingUserId] });
  cy.seedPack({
    users: [
      {
        user_id: existingUserId,
        password: newPassword,
        email_verified: false
      }
    ]
  });
}

describe('1-4-forgot-password', () => {
  beforeEach(() => {
    cy.basicVisit(constants.PATH_LOGIN);
  });

  afterEach(() => {
    cy.noLoading();
  });

  it(`logged out, existing user - should redirect to ${
    constants.PATH_RESET_PASSWORD_SENT
  }`, () => {
    resetData();
    cy.get('[data-cy=forgotPasswordButton]').click();
    cy.get('[data-cy=resetPasswordEmailInput]').type(existingUserId);
    cy.get('[data-cy=resetPasswordSendButton]').click();
    cy.url().should('include', constants.PATH_RESET_PASSWORD_SENT);
  });

  const error1 =
    api.ServerResponseStatusEnum.RESET_PASSWORD_ERROR_USER_DOES_NOT_EXIST;

  it(`logged out, not existing user - should see ${error1}`, () => {
    resetData();
    cy.get('[data-cy=forgotPasswordButton]').click();
    cy.get('[data-cy=resetPasswordEmailInput]').type(notExistingUserId);
    cy.get('[data-cy=resetPasswordSendButton]').click();
    cy.get('[data-cy=message]').should('contain', error1);
  });
});
