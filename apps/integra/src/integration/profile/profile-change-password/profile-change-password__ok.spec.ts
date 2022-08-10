import { common } from '~integra/barrels/common';

let testId = '_profile-change-password__ok';

let email = `${testId}@example.com`;
let password = '123123';

describe('integra', () => {
  it(testId, () => {
    cy.deletePack({ emails: [email] });
    cy.seedPack({
      users: [
        {
          email: email,
          password: password,
          isEmailVerified: common.BoolEnum.TRUE
        }
      ]
    });
    cy.loginUser({ email: email, password: password });
    cy.visit(common.PATH_PROFILE);
    cy.get('[data-cy=profileChangePasswordButton]').click();
    cy.loading();
    cy.url().should('include', common.PATH_PASSWORD_RESET_SENT_AUTH);
    cy.get('[data-cy=passwordResetSentDoneButton]').click();
    cy.loading();
    cy.url().should('include', common.PATH_PROFILE);
  });
});
