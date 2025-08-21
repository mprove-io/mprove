import { PATH_CONFIRM_EMAIL, PATH_REPORTS } from '~common/constants/top';
import { makeId } from '~common/functions/make-id';

let testId = '_confirm-email__ok-first';

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
          isEmailVerified: false,
          emailVerificationToken: emailVerificationToken
        }
      ]
    });
    cy.visit(PATH_CONFIRM_EMAIL + '?token=' + emailVerificationToken);
    cy.loading();
    cy.url().should('include', PATH_REPORTS);
    cy.get('[data-cy=emailIsConfirmedDialogTitle]');
  });
});
