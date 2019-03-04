import * as constants from '../../../src/app/constants/_index';

const userId = '08-02-user@example.com';
const password = '123123';

describe('08-02 logout-auto (logged in)', () => {
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
    cy.get('[data-cy=profileTitle]').should('exist');
    cy.clearLocalStorage();
    cy.url().should('include', constants.PATH_LOGIN);
  });
});
