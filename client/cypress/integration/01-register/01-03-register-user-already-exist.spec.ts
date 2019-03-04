import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '01-03-user@example.com';
const password = '123123';
const error = api.ServerResponseStatusEnum.REGISTER_ERROR_USER_ALREADY_EXISTS;

describe('01-03 register-user-already-exist (logged out)', () => {
  it(`should see ${error}`, () => {
    cy.deletePack({ user_ids: [userId] });
    cy.seedPack({
      users: [
        {
          user_id: userId,
          password: password,
          email_verified: false,
          deleted: true // in case if user deleted
        }
      ]
    });
    cy.basicVisit(constants.PATH_REGISTER);
    cy.get('[data-cy=registerEmailInput]').type(userId);
    cy.get('[data-cy=registerPasswordInput]').type(password);
    cy.get('[data-cy=registerRegisterButton]').click();
    cy.loading();
    cy.get('[data-cy=dialogInfoMessage]').should('contain', error);
  });
});
