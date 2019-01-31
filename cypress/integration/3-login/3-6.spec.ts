import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const error = api.ServerResponseStatusEnum.LOGIN_ERROR_USER_DOES_NOT_EXIST;

describe('3-6 (login) logged out, not registered user', () => {
  it(`should see ${error}`, () => {
    cy.basicVisit(constants.PATH_LOGIN);
    cy.get('[data-cy=emailInput]').type('3-6-user@example.com');
    cy.get('[data-cy=passwordInput]').type('123123');
    cy.get('[data-cy=signInButton]').click();
    cy.get('[data-cy=message]').should('contain', error);
    cy.noLoading();
  });
});
