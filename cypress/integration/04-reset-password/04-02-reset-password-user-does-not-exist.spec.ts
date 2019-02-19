import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '04-02-user@example.com';
const error =
  api.ServerResponseStatusEnum.RESET_PASSWORD_ERROR_USER_DOES_NOT_EXIST;

describe('04-02 reset-password-user-does-not-exist (logged out)', () => {
  it(`should see ${error}`, () => {
    cy.deletePack({ user_ids: [userId] });
    cy.basicVisit(constants.PATH_LOGIN);
    cy.get('[data-cy=loginForgotPasswordButton]').click();
    cy.get('[data-cy=dialogResetPasswordEmailInput]').type(userId);
    cy.get('[data-cy=dialogResetPasswordSendButton]').click();
    cy.loading();
    cy.get('[data-cy=dialogInfoMessage]').should('contain', error);
  });
});
