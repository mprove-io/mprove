import {
  PATH_LOGIN,
  PATH_NEW_PASSWORD_WAS_SET,
  PATH_UPDATE_PASSWORD
} from '~common/constants/top';
import { makeId } from '~common/functions/make-id';

let testId = '_update-password__ok';

let email = `${testId}@example.com`;
let password = '123123';
let passwordResetToken = makeId();
let newPassword = '456456';

describe('integra', () => {
  it(testId, () => {
    cy.deletePack({ emails: [email] });
    cy.seedPack({
      users: [
        {
          email: email,
          password: password,
          isEmailVerified: false,
          passwordResetToken: passwordResetToken
        }
      ]
    });
    cy.visit(PATH_UPDATE_PASSWORD + '?token=' + passwordResetToken);
    cy.get('[data-cy=updatePasswordNewPasswordInput]').type(newPassword);
    cy.get('[data-cy=updatePasswordConfirmPasswordInput]').type(newPassword);
    cy.get('[data-cy=updatePasswordSetPasswordButton]').click();
    cy.loading();
    cy.url().should('include', PATH_NEW_PASSWORD_WAS_SET);
    cy.get('[data-cy="newPasswordWasSetTitle"]');
    cy.get('[data-cy=newPasswordWasSetLoginButton]').click();
    cy.url().should('include', PATH_LOGIN);
  });
});
