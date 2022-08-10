import { common } from '~integra/barrels/common';

let testId = '_login__logged-in';

let email = `${testId}@example.com`;
let password = '123123';

describe('integra', () => {
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
    cy.loginUser({ email: email, password: password });
    cy.visit(common.PATH_LOGIN);
    cy.loading();
    cy.url().should('include', common.PATH_PROFILE);
  });
});
