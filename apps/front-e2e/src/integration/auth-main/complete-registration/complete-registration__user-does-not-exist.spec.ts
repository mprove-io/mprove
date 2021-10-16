import { apiToBackend } from '~front-e2e/barrels/api-to-backend';
import { common } from '~front-e2e/barrels/common';

let testId = '_complete-registration__user-does-not-exist';

let emailToken = common.makeId();
let password = '456456';

let errorMessage = common.transformErrorMessage(
  apiToBackend.ErEnum.BACKEND_USER_DOES_NOT_EXIST
);

describe('front-e2e', () => {
  it(testId, () => {
    cy.visit(common.PATH_COMPLETE_REGISTRATION + '?token=' + emailToken);
    cy.get('[data-cy=completeRegistrationPasswordInput]').type(password);
    cy.get('[data-cy=completeRegistrationSignUpButton]').click();
    cy.loading();
    cy.get('[data-cy=errorDialogMessage]').should('contain', errorMessage);
  });
});
