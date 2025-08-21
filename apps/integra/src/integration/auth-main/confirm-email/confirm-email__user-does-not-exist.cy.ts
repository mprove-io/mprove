import { PATH_CONFIRM_EMAIL } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { makeId } from '~common/functions/make-id';
import { transformErrorMessage } from '~common/functions/transform-error-message';

let testId = '_confirm-email__user-does-not-exist';

let emailVerificationToken = makeId();
let errorMessage = transformErrorMessage(ErEnum.BACKEND_USER_DOES_NOT_EXIST);

describe('integra', () => {
  it(testId, () => {
    cy.visit(PATH_CONFIRM_EMAIL + '?token=' + emailVerificationToken);
    cy.get('[data-cy=errorDialogMessage]').should('contain', errorMessage);
  });
});
