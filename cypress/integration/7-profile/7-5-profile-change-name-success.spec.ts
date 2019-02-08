import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '7-5-user@example.com';
const password = '123123';

const firstName = 'John';
const lastName = 'Smith';

describe('7-5 profile-change-name (logged in)', () => {
  it(`should be able to change name`, () => {
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
    cy.get('[data-cy=editNameFirstNameInput]').type(firstName);
    cy.get('[data-cy=editNameLastNameInput]').type(lastName);
    cy.get('[data-cy=editNameApplyChange]').click();
    cy.loading();
    cy.get('[data-cy=editNameApplyChange]').should('not.exist');
    cy.get('[data-cy=editNameFirstNameInput]').should('have.value', firstName);
    cy.get('[data-cy=editNameLastNameInput]').should('have.value', lastName);
  });
});
