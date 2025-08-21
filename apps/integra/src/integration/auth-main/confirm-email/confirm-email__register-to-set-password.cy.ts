import { PATH_CONFIRM_EMAIL } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { makeId } from '~common/functions/make-id';
import { transformErrorMessage } from '~common/functions/transform-error-message';

let testId = '_confirm-email__register-to-set-password';

let email = `${testId}@example.com`;
let emailVerificationToken = makeId();

let errorMessage = transformErrorMessage(
  ErEnum.BACKEND_REGISTER_TO_SET_PASSWORD
);

describe('integra', () => {
  it(testId, () => {
    cy.deletePack({ emails: [email] });
    cy.seedPack({
      users: [
        {
          email: email,
          isEmailVerified: false,
          emailVerificationToken: emailVerificationToken
        }
      ]
    });
    cy.visit(PATH_CONFIRM_EMAIL + '?token=' + emailVerificationToken);
    cy.get('[data-cy=errorDialogMessage]').should('contain', errorMessage);
  });
});
