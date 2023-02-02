import { common } from '~integra/barrels/common';

let testId = '_complete-registration__ok';

let email = `${testId}@example.com`;
let password = '123123';
let emailToken = common.makeId();

describe('integra', () => {
  it(testId, () => {
    cy.deletePack({ emails: [email] });
    cy.seedPack({
      users: [
        {
          email: email,
          isEmailVerified: common.BoolEnum.FALSE,
          emailVerificationToken: emailToken
        }
      ]
    });
    cy.visit(common.PATH_COMPLETE_REGISTRATION + '?token=' + emailToken);
    cy.get('[data-cy=completeRegistrationPasswordInput]').type(password);
    cy.get('[data-cy=completeRegistrationSignUpButton]').click();
    cy.loading();
    cy.url().should('include', common.PATH_METRICS);
    cy.get('[data-cy=emailIsConfirmedDialogTitle]');
  });
});
