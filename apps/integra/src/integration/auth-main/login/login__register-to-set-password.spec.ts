import { common } from '~integra/barrels/common';

let testId = '_login__register-to-set-password';

let email = `${testId}@example.com`;
let password = '123123';
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
    cy.get(`[data-cy=loginTitle]`);
    cy.get('[data-cy=loginEmailInput]').type(email);
    cy.get('[data-cy=loginPasswordInput]').type(password);
    cy.get('[data-cy=loginButton]').click();
    cy.loading();
    cy.get('[data-cy=errorDialogMessage]').should('contain', errorMessage);
  });
});
