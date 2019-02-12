import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '3-7-user@example.com';
const password = '123123';

describe('3-7 login-logged-in', () => {
  it(`should redirect to ${constants.PATH_PROFILE}`, () => {
    cy.deletePack({
      user_ids: [userId]
    });
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
    cy.basicVisit(constants.PATH_LOGIN);
    cy.loading();
    cy.get('[data-cy=profileTitle]');
  });
});
