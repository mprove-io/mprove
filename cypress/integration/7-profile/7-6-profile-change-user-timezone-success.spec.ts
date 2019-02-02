import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '7-6-user@example.com';
const password = '123123';

const firstName = 'John';
const lastName = 'Smith';

describe('7-6 profile-change-user-timezone (logged in)', () => {
  it(`should be able to change timezone`, () => {
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
    cy.get('[data-cy=updateUserTimezoneSelect').click();
    cy.get('[data-cy=updateUserTimezoneOption]').eq(1).click();
    cy.get('[data-cy=updateUserTimezoneApply]').click();
    cy.loading();
    cy.get('[data-cy=updateUserTimezoneApply]').should('not.exist');
    cy.get('[data-cy=updateUserTimezoneSelect]').should('have.text', 'UTC');
  });
});
