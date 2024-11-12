import { common } from '~integra/barrels/common';

let testId = '_reset-password__ok';

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
          isEmailVerified: false
        }
      ]
    });
    cy.visit(common.PATH_LOGIN);
    cy.get('[data-cy=loginForgotPasswordButton]').click();
    cy.get('[data-cy=forgotPasswordEmailInput]').type(email);
    cy.get('[data-cy=forgotPasswordResetPasswordButton]').click();
    cy.loading();
    cy.url().should('include', common.PATH_PASSWORD_RESET_SENT);
  });
});
