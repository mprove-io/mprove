import { PATH_LOGIN, PATH_PROFILE } from '~common/constants/top';

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
          isEmailVerified: true
        }
      ]
    });
    cy.loginUser({ email: email, password: password });
    cy.visit(PATH_LOGIN);
    cy.loading();
    cy.url().should('include', PATH_PROFILE);
  });
});
