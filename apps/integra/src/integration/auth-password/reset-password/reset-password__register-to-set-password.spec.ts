import { common } from '~integra/barrels/common';

let testId = '_reset-password__register-to-set-password';

let email = `${testId}@example.com`;
let errorMessage = common.transformErrorMessage(
  common.ErEnum.BACKEND_REGISTER_TO_SET_PASSWORD
);

describe('integra', () => {
  it(testId, () => {
    cy.deletePack({ emails: [email] });
    cy.seedPack({
      users: [
        {
          email: email,
          isEmailVerified: common.BoolEnum.FALSE
        }
      ]
    });
    cy.visit(common.PATH_LOGIN);
    cy.get('[data-cy=loginForgotPasswordButton]').click();
    cy.get('[data-cy=forgotPasswordEmailInput]').type(email);
    cy.get('[data-cy=forgotPasswordResetPasswordButton]').click();
    cy.loading();
    cy.get('[data-cy=errorDialogMessage]').should('contain', errorMessage);
  });
});
