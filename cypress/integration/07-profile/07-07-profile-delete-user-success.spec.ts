import * as constants from '../../../src/app/constants/_index';

const userId = '07-07-user@example.com';
const password = '123123';

const firstName = 'John';
const lastName = 'Smith';

describe('07-07 profile-delete-user-success (logged in)', () => {
  it(`should be able to delete user`, () => {
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
    cy.get('[data-cy=profileDeleteUserButton]').click();
    cy.get('[data-cy=dialogDeleteUserYesButton]').click();
    cy.loading();
    cy.url().should('include', constants.PATH_LOGIN);
  });
});
