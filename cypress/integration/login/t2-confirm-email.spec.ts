import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = 't2-user@example.com';
const userPassword = '123123';
const userEmailVerificationToken = 'abcdef';

const errorText =
  api.ServerResponseStatusEnum.CONFIRM_EMAIL_ERROR_USER_DOES_NOT_EXIST;

function resetData() {
  cy.deletePack({ user_ids: [userId] });
  cy.seedPack({
    users: [
      {
        user_id: userId,
        password: userPassword,
        email_verified: false,
        email_verification_token: userEmailVerificationToken,
      }
    ]
  });
}

describe('confirm email', () => {

  context('good token', () => {
    it(`should be redirected to ${constants.PATH_LOGIN}`, () => {
      resetData();
      cy.basicVisit(
        constants.PATH_CONFIRM_EMAIL + '?token=' + userEmailVerificationToken
      );
      cy.url().should('include', constants.PATH_LOGIN);
    });

    it('should see email confirmed dialog', () => {
      resetData();
      cy.basicVisit(
        constants.PATH_CONFIRM_EMAIL + '?token=' + userEmailVerificationToken
      );
      cy.get('[data-cy=message]').should('contain', 'Email is confirmed');
    });
  });

  context('bad token', () => {
    it(`should be redirected to ${constants.PATH_LOGIN}`, () => {
      cy.basicVisit(constants.PATH_CONFIRM_EMAIL + '?token=notExistingToken');
      cy.url().should('include', constants.PATH_LOGIN);
    });

    it(`should see ${errorText} for wrong token`, () => {
      cy.basicVisit(constants.PATH_CONFIRM_EMAIL + '?token=notExistingToken');
      cy.get('[data-cy=message]').should('contain', errorText);
    });

    it(`should see ${errorText} for empty token`, () => {
      cy.basicVisit(constants.PATH_CONFIRM_EMAIL + '?token=');
      cy.get('[data-cy=message]').should('contain', errorText);
    });

    it(`should see ${errorText} for no token`, () => {
      cy.basicVisit(constants.PATH_CONFIRM_EMAIL + '');
      cy.get('[data-cy=message]').should('contain', errorText);
    });
  });
});
