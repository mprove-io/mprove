import * as constants from '../../../src/app/constants/_index';

const userId = 't1-new-user@example.com';
const userPass = '123123';

function reset() {
  cy.deletePack({ user_ids: [userId] });
}

describe('register', () => {

  beforeEach(() => {
    cy.basicVisit(constants.PATH_REGISTER);
  });

  it('should display main heading', () => {
    cy.get('h3').should('contain', 'Register');
  });

  it(`should be able to register`, () => {
    reset();
    cy.get('[data-cy=emailInput]').type(userId);
    cy.get('[data-cy=passwordInput]').type(userPass);
    cy.get('[data-cy=registerButton]').click();
  });

  it(`should be redirected to ${constants.PATH_VERIFY_EMAIL_SENT}`, () => {
    reset();
    cy.get('[data-cy=emailInput]').type(userId);
    cy.get('[data-cy=passwordInput]').type(userPass);
    cy.get('[data-cy=registerButton]').click();
    cy.url().should('include', constants.PATH_VERIFY_EMAIL_SENT);
  });
});
