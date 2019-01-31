import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const existingUserId = '1-1-existing-user@example.com';
const existingUserPassword = '123123';

const newUserId = '1-1-new-user@example.com';
const newUserPassword = '456456';

function resetData() {
  cy.deletePack({ user_ids: [existingUserId, newUserId] });
  cy.seedPack({
    users: [
      {
        user_id: existingUserId,
        password: existingUserPassword,
        email_verified: false
      }
    ]
  });
}

describe('1-1-register', () => {
  beforeEach(() => {
    cy.basicVisit(constants.PATH_REGISTER);
  });

  afterEach(() => {
    cy.noLoading();
  });

  it(`should display title`, () => {
    cy.get(`[data-cy=registerTitle]`);
  });

  it(`new user - should be able to register, redirect to ${
    constants.PATH_VERIFY_EMAIL_SENT
  }`, () => {
    resetData();
    cy.get('[data-cy=emailInput]').type(newUserId);
    cy.get('[data-cy=passwordInput]').type(newUserPassword);
    cy.get('[data-cy=registerButton]').click();
    cy.url().should('include', constants.PATH_VERIFY_EMAIL_SENT);
  });

  const error1 =
    api.ServerResponseStatusEnum.REGISTER_ERROR_USER_ALREADY_EXISTS;

  it(`existing user - should see ${error1}`, () => {
    resetData();
    cy.get('[data-cy=emailInput]').type(existingUserId);
    cy.get('[data-cy=passwordInput]').type(newUserPassword);
    cy.get('[data-cy=registerButton]').click();
    cy.get('[data-cy=message]').should('contain', error1);
  });
});
