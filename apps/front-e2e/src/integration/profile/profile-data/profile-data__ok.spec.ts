import { common } from '~front-e2e/barrels/common';

let testId = '_profile-data__ok';

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
    cy.loginUser({ email: email, password: password });
    cy.visit(common.PATH_PROFILE);
    cy.get(`[data-cy=profileTitle]`);
    cy.get('[data-cy=profileTimezone]').should(
      'contain',
      common.USE_PROJECT_TIMEZONE_LABEL
    );
    cy.get('[data-cy=profileEmail]').should('contain', email);
  });
});
