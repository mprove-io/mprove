import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '4-2-user@example.com';
const error =
  api.ServerResponseStatusEnum.RESET_PASSWORD_ERROR_USER_DOES_NOT_EXIST;

describe('4-2 (forgot-password) logged out, not existing user', () => {
  it(`should see ${error}`, () => {
    cy.deletePack({ user_ids: [userId] });
    cy.basicVisit(constants.PATH_LOGIN);
    cy.get('[data-cy=forgotPasswordButton]').click();
    cy.get('[data-cy=resetPasswordEmailInput]').type(userId);
    cy.get('[data-cy=resetPasswordSendButton]').click();
    cy.get('[data-cy=message]').should('contain', error);
    cy.noLoading();
  });
});
