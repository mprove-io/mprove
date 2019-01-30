import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const existingUserId = 't3-existing-user@example.com';

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

describe('t3-login', () => {
  beforeEach(() => {
    cy.basicVisit(constants.PATH_LOGIN);
  });

  afterEach(() => {
    cy.noLoading();
  });

  const mainHeading = 'Sign In';
  it(`should display heading "${mainHeading}"`, () => {
    cy.get('h3').should('contain', mainHeading);
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

  it(`existing user, wrong password - should see ${
    api.ServerResponseStatusEnum.LOGIN_ERROR_WRONG_PASSWORD
  }`, () => {
    resetData({ password: '123123', email_verified: false });
    cy.get('[data-cy=emailInput]').type(existingUserId);
    cy.get('[data-cy=passwordInput]').type('456456');
    cy.get('[data-cy=signInButton]').click();
    cy.get('[data-cy=message]').should(
      'contain',
      api.ServerResponseStatusEnum.LOGIN_ERROR_WRONG_PASSWORD
    );
  });

  it(`existing user, password not set - should see ${
    api.ServerResponseStatusEnum.LOGIN_ERROR_REGISTER_TO_SET_PASSWORD
  }`, () => {
    resetData({ password: undefined, email_verified: false });
    cy.get('[data-cy=emailInput]').type(existingUserId);
    cy.get('[data-cy=passwordInput]').type('789789');
    cy.get('[data-cy=signInButton]').click();
    cy.get('[data-cy=message]').should(
      'contain',
      api.ServerResponseStatusEnum.LOGIN_ERROR_REGISTER_TO_SET_PASSWORD
    );
  });

  it(`not registered user - should see ${
    api.ServerResponseStatusEnum.LOGIN_ERROR_USER_DOES_NOT_EXIST
  }`, () => {
    cy.get('[data-cy=emailInput]').type('t3-new-user@example.com');
    cy.get('[data-cy=passwordInput]').type('456456');
    cy.get('[data-cy=signInButton]').click();
    cy.get('[data-cy=message]').should(
      'contain',
      api.ServerResponseStatusEnum.LOGIN_ERROR_USER_DOES_NOT_EXIST
    );
  });
});
