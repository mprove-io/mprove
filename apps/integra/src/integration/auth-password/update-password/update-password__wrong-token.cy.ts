import { PATH_UPDATE_PASSWORD } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { makeId } from '~common/functions/make-id';

let testId = '_update-password__wrong-token';

let email = `${testId}@example.com`;
let password = '123123';
let newPassword = '456456';

let passwordResetToken = makeId();
let wrongPasswordResetToken = makeId();

let errorMessage = ErEnum.BACKEND_UPDATE_PASSWORD_WRONG_TOKEN;

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
    cy.visit(PATH_UPDATE_PASSWORD + '?token=' + wrongPasswordResetToken);
    cy.get('[data-cy=updatePasswordNewPasswordInput]').type(newPassword);
    cy.get('[data-cy=updatePasswordConfirmPasswordInput]').type(newPassword);
    cy.get('[data-cy=updatePasswordSetPasswordButton]').click();
    cy.loading();
    cy.get('[data-cy=errorDialogMessage]').should('contain', errorMessage);
  });
});
