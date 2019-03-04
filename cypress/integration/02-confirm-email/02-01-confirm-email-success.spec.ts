import * as constants from '../../../src/app/constants/_index';

const userId = '02-01-user@example.com';
const userPassword = '123123';
const userEmailVerificationToken = 'abcdef';
const infoText = 'Email is confirmed';

describe('02-01 confirm-email-success (logged out)', () => {
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
    cy.loading();
    cy.get('[data-cy=dialogInfoMessage]').should('contain', infoText);
  });
});
