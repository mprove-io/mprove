import { PATH_LOGIN } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';

let testId = '_login__wrong-password';

let email = `${testId}@example.com`;
let password = '123123';
let wrongPassword = '456456';
let errorMessage = ErEnum.BACKEND_WRONG_PASSWORD;

describe('integra', () => {
  it(testId, () => {
    cy.deletePack({ emails: [email] });
    cy.seedPack({
      users: [
        {
          email: email,
          password: password,
          isEmailVerified: true
        }
      ]
    });
    cy.visit(PATH_LOGIN);
    cy.get(`[data-cy=loginTitle]`);
    cy.get('[data-cy=loginEmailInput]').type(email);
    cy.get('[data-cy=loginPasswordInput]').type(wrongPassword);
    cy.get('[data-cy=loginButton]').click();
    cy.loading();
    cy.get('[data-cy=errorDialogMessage]').should('contain', errorMessage);
  });
});
