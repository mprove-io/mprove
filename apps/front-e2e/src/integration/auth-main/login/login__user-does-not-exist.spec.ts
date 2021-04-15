import { apiToBackend } from '~front-e2e/barrels/api-to-backend';
import { common } from '~front-e2e/barrels/common';

let testId = '_login__user-does-not-exist';

let email = `${testId}@example.com`;
let password = '123123';
let errorMessage = common.transformErrorMessage(
  apiToBackend.ErEnum.BACKEND_USER_DOES_NOT_EXIST
);

describe('front-e2e', () => {
  it(testId, () => {
    cy.deletePack({ emails: [email] });
    cy.visit(common.PATH_LOGIN);
    cy.get(`[data-cy=loginTitle]`);
    cy.get('[data-cy=loginEmailInput]').type(email);
    cy.get('[data-cy=loginPasswordInput]').type(password);
    cy.get('[data-cy=loginButton]').click();
    cy.loading();
    cy.get('[data-cy=errorDialogMessage]').should('contain', errorMessage);
  });
});
