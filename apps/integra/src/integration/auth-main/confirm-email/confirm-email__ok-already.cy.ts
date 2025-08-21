import {
  PATH_CONFIRM_EMAIL,
  PATH_EMAIL_CONFIRMED
} from '~common/constants/top';
import { makeId } from '~common/functions/make-id';

let testId = '_confirm-email__ok-already';

let email = `${testId}@example.com`;
let password = '123123';
let emailVerificationToken = makeId();

describe('integra', () => {
  it(testId, () => {
    cy.deletePack({ emails: [email] });
    cy.seedPack({
      users: [
        {
          email: email,
          password: password,
          isEmailVerified: true,
          emailVerificationToken: emailVerificationToken
        }
      ]
    });
    cy.visit(PATH_CONFIRM_EMAIL + '?token=' + emailVerificationToken);
    cy.loading();
    cy.url().should('include', PATH_EMAIL_CONFIRMED);
    cy.get('[data-cy=emailIsConfirmedTitle]');
  });
});
