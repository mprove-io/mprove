import { common } from '~integra/barrels/common';

let testId = '_complete-registration__user-does-not-exist';

let emailToken = common.makeId();
let password = '456456';

let errorMessage = common.transformErrorMessage(
  common.ErEnum.BACKEND_USER_DOES_NOT_EXIST
);

describe('integra', () => {
  it(testId, () => {
    cy.visit(common.PATH_COMPLETE_REGISTRATION + '?token=' + emailToken);
    cy.get('[data-cy=completeRegistrationPasswordInput]').type(password);
    cy.get('[data-cy=completeRegistrationSignUpButton]').click();
    cy.loading();
    cy.get('[data-cy=errorDialogMessage]').should('contain', errorMessage);
  });
});
