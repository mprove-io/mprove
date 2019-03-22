import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '07-01-user@example.com';
const password = '123123';

describe('07-01 profile-data (logged in)', () => {
  it(`should see data`, () => {
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
    cy.loginUser({ user_id: userId, password: password });
    cy.basicVisit(constants.PATH_PROFILE);
    cy.loading();
    cy.get('[data-cy=profileTitle]').should('exist');
    cy.get('[data-cy=editNameFirstNameInput]').should('have.value', '');
    cy.get('[data-cy=editNameLastNameInput]').should('have.value', '');
    cy.get('[data-cy=updateUserTimezoneSelect]').should(
      'have.text',
      'Use Project Default'
    );
    cy.get('[data-cy=profileEmailData]').should('have.text', userId);
  });
});
