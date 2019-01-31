import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '2-1-user@example.com';
const password = '123123';

function resetData() {
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
}

describe('2-1-profile', () => {
  beforeEach(() => {
    resetData();
  });

  afterEach(() => {
    cy.noLoading();
  });

  it(`no token - should redirect to "${constants.PATH_LOGIN}"`, () => {
    cy.basicVisit(constants.PATH_PROFILE);
    cy.get('[data-cy=loginTitle]');
  });

  it(`good token - should see Profile`, () => {
    cy.loginUser({ user_id: userId, password: password });
    cy.basicVisit(constants.PATH_PROFILE);
    cy.get('[data-cy=profileTitle]');
  });

  it(`good token, visit "${
    constants.PATH_LOGIN
  }" - should redirect to Profile`, () => {
    cy.loginUser({ user_id: userId, password: password });
    cy.basicVisit(constants.PATH_LOGIN);
    cy.get('[data-cy=profileTitle]');
  });

  it(`good token, visit "${
    constants.PATH_REGISTER
  }" - should redirect to Profile`, () => {
    cy.loginUser({ user_id: userId, password: password });
    cy.basicVisit(constants.PATH_REGISTER);
    cy.get('[data-cy=profileTitle]');
  });
});
