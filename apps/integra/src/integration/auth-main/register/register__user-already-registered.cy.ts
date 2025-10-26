import { PATH_REGISTER } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';

let testId = '_register__user-already-registered';

let email = `${testId}@example.com`;
let password = '123123';
let errorMessage = ErEnum.BACKEND_USER_ALREADY_REGISTERED;

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
    cy.visit(PATH_REGISTER);
    cy.get(`[data-cy=registerTitle]`);
    cy.get('[data-cy=registerEmailInput]').type(email);
    cy.get('[data-cy=registerPasswordInput]').type(password);
    cy.get('[data-cy=registerSignUpButton]').click();
    cy.loading();
    cy.get('[data-cy=errorDialogMessage]').should('contain', errorMessage);
  });
});
