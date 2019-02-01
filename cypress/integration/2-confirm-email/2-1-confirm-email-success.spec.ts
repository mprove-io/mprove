import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '2-1-user@example.com';
const userPassword = '123123';
const userEmailVerificationToken = 'abcdef';
const infoText = 'Email is confirmed';

describe('2-1 confirm-email-success (logged out)', () => {
  it(`should see "${infoText}", redirect to ${constants.PATH_LOGIN}`, () => {
    cy.deletePack({ user_ids: [userId] });
    cy.seedPack({
      users: [
        {
          user_id: userId,
          password: userPassword,
          email_verified: false,
          email_verification_token: userEmailVerificationToken
        }
      ]
    });
    cy.basicVisit(
      constants.PATH_CONFIRM_EMAIL + '?token=' + userEmailVerificationToken
    );
    cy.get('[data-cy=infoMessage]').should('contain', infoText);
    cy.noLoading();
  });
});
