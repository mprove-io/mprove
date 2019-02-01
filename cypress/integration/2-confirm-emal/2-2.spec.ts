import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const error1 =
  api.ServerResponseStatusEnum.CONFIRM_EMAIL_ERROR_USER_DOES_NOT_EXIST;

describe('2-2 (confirm-email) logged out, bad emailVerificationToken - ', () => {
  it(`should see ${error1}, redirect to ${constants.PATH_LOGIN}`, () => {
    cy.basicVisit(constants.PATH_CONFIRM_EMAIL + '?token=notExistingToken');
    cy.url().should('include', constants.PATH_LOGIN);
    cy.get('[data-cy=message]').should('contain', error1);
    cy.noLoading();
  });
});
