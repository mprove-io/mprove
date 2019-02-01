import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '1-3-user@example.com';
const password = '123123';
const error1 = api.ServerResponseStatusEnum.REGISTER_ERROR_USER_ALREADY_EXISTS;

describe('1-3 register-user-already-exist (logged out)', () => {
  it(`should see ${error1}`, () => {
    cy.deletePack({ user_ids: [userId] });
    cy.seedPack({
      users: [
        {
          user_id: userId,
          password: password,
          email_verified: false
        }
      ]
    });
    cy.basicVisit(constants.PATH_REGISTER);
    cy.get('[data-cy=registerEmailInput]').type(userId);
    cy.get('[data-cy=registerPasswordInput]').type(password);
    cy.get('[data-cy=registerRegisterButton]').click();
    cy.get('[data-cy=infoMessage]').should('contain', error1);
    cy.noLoading();
  });
});
