import { common } from '~front-e2e/barrels/common';

let testId = '_login__ok';

let email = `${testId}@example.com`;
let password = '123123';

describe('front-e2e', () => {
  it(testId, () => {
    cy.deletePack({ emails: [email] });
    cy.seedPack({
      users: [
        {
          email: email,
          password: password,
          isEmailVerified: common.BoolEnum.TRUE
        }
      ]
    });
    cy.visit(common.PATH_LOGIN);
    cy.get(`[data-cy=loginTitle]`);
    cy.get('[data-cy=loginEmailInput]').type(email);
    cy.get('[data-cy=loginPasswordInput]').type(password);
    cy.get('[data-cy=loginButton]').click();
    cy.loading();
    cy.url().should('include', common.PATH_PROFILE);
  });
});
