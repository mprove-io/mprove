import * as constants from '../../../src/app/constants/_index';

const userId = '08-01-user@example.com';
const password = '123123';

describe('08-01 logout-by-user (logged in)', () => {
  it(`should be able to logout, redirect to ${constants.PATH_LOGIN}`, () => {
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
    cy.get('[data-cy=userMenuButton]').click();
    cy.get('[data-cy=logoutButton]').click();
    cy.url().should('include', constants.PATH_LOGIN);
  });
});
