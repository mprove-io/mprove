import * as constants from '../../../src/app/constants/_index';

const userId = 't1-new-user@example.com';
const userPass = '123123';

describe('register', () => {
  before(() => {
    cy.deletePack({ user_ids: [userId] });
  });

  beforeEach(() => {
    cy.basicVisit(constants.PATH_REGISTER);
  });

  it('should display main heading', () => {
    cy.get('h3').should('contain', 'Register');
  });

  it('should be able to register', () => {
    cy.get('[data-cy=emailInput]').type(userId);
    cy.get('[data-cy=passwordInput]').type(userPass);
    cy.get('[data-cy=registerButton]').click();
    cy.url().should('include', constants.PATH_VERIFY_EMAIL_SENT);
  });
});
