import {
  PATH_COMPLETE_REGISTRATION,
  PATH_REPORTS
} from '~common/constants/top';
import { makeId } from '~common/functions/make-id';

let testId = '_complete-registration__ok';

let email = `${testId}@example.com`;
let password = '123123';
let emailToken = makeId();

describe('integra', () => {
  it(testId, () => {
    cy.deletePack({ emails: [email] });
    cy.seedPack({
      users: [
        {
          email: email,
          isEmailVerified: false,
          emailVerificationToken: emailToken
        }
      ]
    });
    cy.visit(PATH_COMPLETE_REGISTRATION + '?token=' + emailToken);
    cy.get('[data-cy=completeRegistrationPasswordInput]').type(password);
    cy.get('[data-cy=completeRegistrationSignUpButton]').click();
    cy.loading();
    cy.url().should('include', PATH_REPORTS);
    cy.get('[data-cy=emailIsConfirmedDialogTitle]');
  });
});
