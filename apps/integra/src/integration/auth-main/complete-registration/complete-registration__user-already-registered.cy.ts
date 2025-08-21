import { PATH_COMPLETE_REGISTRATION } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { makeId } from '~common/functions/make-id';
import { transformErrorMessage } from '~common/functions/transform-error-message';

let testId = '_complete-registration__user-already-registered';

let email = `${testId}@example.com`;
let emailToken = makeId();
let password = '456456';

let errorMessage = transformErrorMessage(
  ErEnum.BACKEND_USER_ALREADY_REGISTERED
);

describe('integra', () => {
  it(testId, () => {
    cy.deletePack({ emails: [email] });
    cy.seedPack({
      users: [
        {
          email: email,
          isEmailVerified: true,
          emailVerificationToken: emailToken
        }
      ]
    });
    cy.visit(PATH_COMPLETE_REGISTRATION + '?token=' + emailToken);
    cy.get('[data-cy=completeRegistrationPasswordInput]').type(password);
    cy.get('[data-cy=completeRegistrationSignUpButton]').click();
    cy.loading();
    cy.get('[data-cy=errorDialogMessage]').should('contain', errorMessage);
  });
});
