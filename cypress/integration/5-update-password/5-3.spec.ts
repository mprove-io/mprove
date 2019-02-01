import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const newPassword = '456456';
const error = api.ServerResponseStatusEnum.UPDATE_PASSWORD_ERROR_TOKEN_EXPIRED;

describe('5-3 (update-password) logged out, bad passwordResetToken', () => {
  it(`should see ${error}, redirect to ${constants.PATH_LOGIN}`, () => {
    cy.basicVisit(constants.PATH_UPDATE_PASSWORD + '?token=notExistingToken');
    cy.get('[data-cy=updatePasswordNewPasswordInput]').type(newPassword);
    cy.get('[data-cy=updatePasswordConfirmPasswordInput]').type(newPassword);
    cy.get('[data-cy=updatePasswordSetPasswordButton]').click();
    cy.url().should('include', constants.PATH_LOGIN);
    cy.get('[data-cy=message]').should('contain', error);
    cy.noLoading();
  });
});
