import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = 't3-user@example.com';
const userPassword = '123123';

const mainHeading = 'Sign In';

function resetData() {
  cy.deletePack({ user_ids: [userId] });
  cy.seedPack({
    users: [
      {
        user_id: userId,
        password: userPassword,
        email_verified: true
      }
    ]
  });
}

describe('t3-login', () => {
  beforeEach(() => {
    cy.basicVisit(constants.PATH_LOGIN);
  });

  it(`should display heading "${mainHeading}"`, () => {
    cy.get('h3').should('contain', mainHeading);
  });

  it(`should be able to login, redirect to ${constants.PATH_PROFILE}`, () => {
    resetData();
    cy.get('[data-cy=emailInput]').type(userId);
    cy.get('[data-cy=passwordInput]').type(userPassword);
    cy.get('[data-cy=signInButton]').click();
    cy.url().should('include', constants.PATH_PROFILE);
  });
});
