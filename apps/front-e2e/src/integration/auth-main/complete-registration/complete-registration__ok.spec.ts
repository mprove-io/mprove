import { common } from '~front-e2e/barrels/common';

let testId = '_complete-registration__ok';

let email = `${testId}@example.com`;
let password = '123123';
let emailToken = common.makeId();

describe('front-e2e', () => {
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
    cy.url().should('include', common.PATH_VISUALIZATIONS);
    cy.get('[data-cy=emailIsConfirmedDialogTitle]');
  });
});
