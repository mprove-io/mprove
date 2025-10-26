import { PATH_LOGIN } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';

let testId = '_reset-password__user-does-not-exist';

let email = `${testId}@example.com`;
let errorMessage = ErEnum.BACKEND_USER_DOES_NOT_EXIST;

describe('integra', () => {
  it(testId, () => {
    cy.deletePack({ emails: [email] });
    cy.visit(PATH_LOGIN);
    cy.get('[data-cy=loginForgotPasswordButton]').click();
    cy.get('[data-cy=forgotPasswordEmailInput]').type(email);
    cy.get('[data-cy=forgotPasswordResetPasswordButton]').click();
    cy.loading();
    cy.get('[data-cy=errorDialogMessage]').should('contain', errorMessage);
  });
});
