import { apiToBackend } from '~front-e2e/barrels/api-to-backend';
import { common } from '~front-e2e/barrels/common';

let testId = '_confirm-email__user-does-not-exist';

let emailVerificationToken = common.makeId();
let errorMessage = common.transformErrorMessage(
  apiToBackend.ErEnum.BACKEND_USER_DOES_NOT_EXIST
);

describe('front-e2e', () => {
  it(testId, () => {
    cy.visit(common.PATH_CONFIRM_EMAIL + '?token=' + emailVerificationToken);
    cy.loading();
    cy.get('[data-cy=errorDialogMessage]').should('contain', errorMessage);
  });
});
