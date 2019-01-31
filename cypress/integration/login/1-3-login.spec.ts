import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const existingUserId = '1-3-existing-user@example.com';

function resetData(item: { password: string; email_verified: boolean }) {
  cy.deletePack({ user_ids: [existingUserId] });
  cy.seedPack({
    users: [
      {
        user_id: existingUserId,
        password: item.password,
        email_verified: item.email_verified
      }
    ]
  });
}

describe('1-3-login', () => {
  beforeEach(() => {
    cy.basicVisit(constants.PATH_LOGIN);
  });

  afterEach(() => {
    cy.noLoading();
  });

  it(`should display title`, () => {
    cy.get(`[data-cy=loginTitle]`);
  });

  it(`existing user, valid password, email verified - should be able to login, redirect to ${
    constants.PATH_PROFILE
  }`, () => {
    resetData({ password: '123123', email_verified: true });
    cy.get('[data-cy=emailInput]').type(existingUserId);
    cy.get('[data-cy=passwordInput]').type('123123');
    cy.get('[data-cy=signInButton]').click();
    cy.url().should('include', constants.PATH_PROFILE);
  });

  it(`existing user, valid password, email is not verified - should be able to login, redirect to ${
    constants.PATH_VERIFY_EMAIL_SENT
  }`, () => {
    resetData({ password: '123123', email_verified: false });
    cy.get('[data-cy=emailInput]').type(existingUserId);
    cy.get('[data-cy=passwordInput]').type('123123');
    cy.get('[data-cy=signInButton]').click();
    cy.url().should('include', constants.PATH_VERIFY_EMAIL_SENT);
  });

  const error1 = api.ServerResponseStatusEnum.LOGIN_ERROR_WRONG_PASSWORD;

  it(`existing user, wrong password - should see ${error1}`, () => {
    resetData({ password: '123123', email_verified: false });
    cy.get('[data-cy=emailInput]').type(existingUserId);
    cy.get('[data-cy=passwordInput]').type('456456');
    cy.get('[data-cy=signInButton]').click();
    cy.get('[data-cy=message]').should('contain', error1);
  });

  const error2 =
    api.ServerResponseStatusEnum.LOGIN_ERROR_REGISTER_TO_SET_PASSWORD;

  it(`existing user, password not set - should see ${error2}`, () => {
    resetData({ password: undefined, email_verified: false });
    cy.get('[data-cy=emailInput]').type(existingUserId);
    cy.get('[data-cy=passwordInput]').type('789789');
    cy.get('[data-cy=signInButton]').click();
    cy.get('[data-cy=message]').should('contain', error2);
  });

  const error3 = api.ServerResponseStatusEnum.LOGIN_ERROR_USER_DOES_NOT_EXIST;

  it(`not registered user - should see ${error3}`, () => {
    cy.get('[data-cy=emailInput]').type('1-3-new-user@example.com');
    cy.get('[data-cy=passwordInput]').type('456456');
    cy.get('[data-cy=signInButton]').click();
    cy.get('[data-cy=message]').should('contain', error3);
  });
});
