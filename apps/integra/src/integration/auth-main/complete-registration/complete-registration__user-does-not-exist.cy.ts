import { PATH_COMPLETE_REGISTRATION } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { makeId } from '~common/functions/make-id';
import { transformErrorMessage } from '~common/functions/transform-error-message';

let testId = '_complete-registration__user-does-not-exist';

let emailToken = makeId();
let password = '456456';

let errorMessage = transformErrorMessage(ErEnum.BACKEND_USER_DOES_NOT_EXIST);

describe('integra', () => {
  it(testId, () => {
    cy.visit(PATH_COMPLETE_REGISTRATION + '?token=' + emailToken);
    cy.get('[data-cy=completeRegistrationPasswordInput]').type(password);
    cy.get('[data-cy=completeRegistrationSignUpButton]').click();
    cy.loading();
    cy.get('[data-cy=errorDialogMessage]').should('contain', errorMessage);
  });
});
