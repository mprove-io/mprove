import { PATH_LOGIN } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';

let testId = '_login__user-does-not-exist';

let email = `${testId}@example.com`;
let password = '123123';
let errorMessage = ErEnum.BACKEND_USER_DOES_NOT_EXIST;

describe('integra', () => {
  it(testId, () => {
    cy.deletePack({ emails: [email] });
    cy.visit(PATH_LOGIN);
    cy.get(`[data-cy=loginTitle]`);
    cy.get('[data-cy=loginEmailInput]').type(email);
    cy.get('[data-cy=loginPasswordInput]').type(password);
    cy.get('[data-cy=loginButton]').click();
    cy.loading();
    cy.get('[data-cy=errorDialogMessage]').should('contain', errorMessage);
  });
});
