import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '7-1-user@example.com';
const password = '123123';

describe('7-1 (profile) logged in', () => {
  it(`should see Profile`, () => {
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
    cy.get('[data-cy=profileTitle]');
    cy.noLoading();
  });
});
