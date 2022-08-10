import { common } from '~integra/barrels/common';

let testId = '_update-password__ok';

let email = `${testId}@example.com`;
let password = '123123';
let passwordResetToken = common.makeId();
let newPassword = '456456';

describe('integra', () => {
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
    cy.visit(common.PATH_UPDATE_PASSWORD + '?token=' + passwordResetToken);
    cy.get('[data-cy=updatePasswordNewPasswordInput]').type(newPassword);
    cy.get('[data-cy=updatePasswordConfirmPasswordInput]').type(newPassword);
    cy.get('[data-cy=updatePasswordSetPasswordButton]').click();
    cy.loading();
    cy.url().should('include', common.PATH_NEW_PASSWORD_WAS_SET);
    cy.get('[data-cy="newPasswordWasSetTitle"]');
    cy.get('[data-cy=newPasswordWasSetLoginButton]').click();
    cy.url().should('include', common.PATH_LOGIN);
  });
});
