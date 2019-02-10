import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '1-2-user@example.com';
const password = '123123';

describe('1-2 register-success (logged out, new user)', () => {
  it(`should be able to register, redirect to ${
    constants.PATH_VERIFY_EMAIL_SENT
  }`, () => {
    cy.deletePack({ user_ids: [userId] });
    cy.basicVisit(constants.PATH_REGISTER);
    cy.get('[data-cy=registerEmailInput]').type(userId);
    cy.get('[data-cy=registerPasswordInput]').type(password);
    cy.get('[data-cy=registerRegisterButton]').click();
    cy.loading();
    cy.url({ timeout: 15000 }).should(
      'include',
      constants.PATH_VERIFY_EMAIL_SENT
    );
  });
});
