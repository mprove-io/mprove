import * as constants from '../../../src/app/constants/_index';

const userId = 't1-new-user@example.com';
const userPassword = '123123';

const mainHeading = 'Register';

function resetData() {
  cy.deletePack({ user_ids: [userId] });
}

describe('register', () => {
  beforeEach(() => {
    cy.basicVisit(constants.PATH_REGISTER);
  });

  it(`should display heading "${mainHeading}"`, () => {
    cy.get('h3').should('contain', mainHeading);
  });

  it(`should be able to register, redirect to ${
    constants.PATH_VERIFY_EMAIL_SENT
  }`, () => {
    resetData();
    cy.get('[data-cy=emailInput]').type(userId);
    cy.get('[data-cy=passwordInput]').type(userPassword);
    cy.get('[data-cy=registerButton]').click();
    cy.url().should('include', constants.PATH_VERIFY_EMAIL_SENT);
  });
});
