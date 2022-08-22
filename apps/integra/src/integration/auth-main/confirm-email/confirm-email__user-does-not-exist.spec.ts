import { common } from '~integra/barrels/common';

let testId = '_confirm-email__user-does-not-exist';

let emailVerificationToken = common.makeId();
let errorMessage = common.transformErrorMessage(
  common.ErEnum.BACKEND_USER_DOES_NOT_EXIST
);

describe('integra', () => {
  it(testId, () => {
    cy.visit(common.PATH_CONFIRM_EMAIL + '?token=' + emailVerificationToken);
    cy.loading();
    cy.get('[data-cy=errorDialogMessage]').should('contain', errorMessage);
  });
});
