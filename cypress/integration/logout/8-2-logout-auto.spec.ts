import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '8-2-user@example.com';
const password = '123123';

describe('8-2 logout-auto (logged in)', () => {
  it(`should auto logout, redirect to ${constants.PATH_LOGIN}`, () => {
    cy.deletePack({ user_ids: [userId] });
    cy.seedPack({
      users: [
        {
          user_id: userId,
          password: password,
          email_verified: true
        }
      ]
    });
    cy.loginUser({ user_id: userId, password: password });
    cy.basicVisit(constants.PATH_PROFILE);
    cy.loading();
    cy.get('[data-cy=profileTitle]');
    cy.clearLocalStorage();
    cy.url().should('include', constants.PATH_LOGIN);
  });
});
