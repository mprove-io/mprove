import { apiToBackend } from '~front-e2e/barrels/api-to-backend';
import { common } from '~front-e2e/barrels/common';

let testId = '_login__wrong-password';

let email = `${testId}@example.com`;
let password = '123123';
let wrongPassword = '456456';
let errorMessage = common.transformErrorMessage(
  apiToBackend.ErEnum.BACKEND_WRONG_PASSWORD
);

describe('front-e2e', () => {
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
