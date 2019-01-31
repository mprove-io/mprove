import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '3-4-user@example.com';
const password = '123123';
const error = api.ServerResponseStatusEnum.LOGIN_ERROR_WRONG_PASSWORD;

describe('3-4 (login) logged out, existing user, wrong password', () => {
  it(`should see ${error}`, () => {
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
    cy.get('[data-cy=emailInput]').type(userId);
    cy.get('[data-cy=passwordInput]').type('456456');
    cy.get('[data-cy=signInButton]').click();
    cy.get('[data-cy=message]').should('contain', error);
    cy.noLoading();
  });
});
