import { apiToBackend } from '~front-e2e/barrels/api-to-backend';
import { common } from '~front-e2e/barrels/common';

let testId = '_update-password__wrong-token';

let email = `${testId}@example.com`;
let password = '123123';
let newPassword = '456456';

let passwordResetToken = common.makeId();
let wrongPasswordResetToken = common.makeId();

let errorMessage = common.transformErrorMessage(
  apiToBackend.ErEnum.BACKEND_UPDATE_PASSWORD_WRONG_TOKEN
);

describe('front-e2e', () => {
  it(testId, () => {
    cy.deletePack({ emails: [email] });
    cy.seedPack({
      users: [
        {
          email: email,
          password: password,
          isEmailVerified: common.BoolEnum.FALSE,
          passwordResetToken: passwordResetToken
        }
      ]
    });
    cy.visit(common.PATH_UPDATE_PASSWORD + '?token=' + wrongPasswordResetToken);
    cy.get('[data-cy=updatePasswordNewPasswordInput]').type(newPassword);
    cy.get('[data-cy=updatePasswordConfirmPasswordInput]').type(newPassword);
    cy.get('[data-cy=updatePasswordSetPasswordButton]').click();
    cy.loading();
    cy.get('[data-cy=errorDialogMessage]').should('contain', errorMessage);
  });
});
