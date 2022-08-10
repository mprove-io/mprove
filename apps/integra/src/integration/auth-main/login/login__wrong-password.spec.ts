import { apiToBackend } from '~integra/barrels/api-to-backend';
import { common } from '~integra/barrels/common';

let testId = '_login__wrong-password';

let email = `${testId}@example.com`;
let password = '123123';
let wrongPassword = '456456';
let errorMessage = common.transformErrorMessage(
  apiToBackend.ErEnum.BACKEND_WRONG_PASSWORD
);

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
    cy.visit(common.PATH_LOGIN);
    cy.get(`[data-cy=loginTitle]`);
    cy.get('[data-cy=loginEmailInput]').type(email);
    cy.get('[data-cy=loginPasswordInput]').type(wrongPassword);
    cy.get('[data-cy=loginButton]').click();
    cy.loading();
    cy.get('[data-cy=errorDialogMessage]').should('contain', errorMessage);
  });
});
