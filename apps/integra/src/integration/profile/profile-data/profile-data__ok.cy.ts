import {
  PATH_PROFILE,
  USE_PROJECT_TIMEZONE_LABEL
} from '~common/constants/top';

let testId = '_profile-data__ok';

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
    cy.visit(PATH_PROFILE);
    cy.get(`[data-cy=profileTitle]`);
    cy.get('[data-cy=profileTimezone]').should(
      'contain',
      USE_PROJECT_TIMEZONE_LABEL
    );
    cy.get('[data-cy=profileEmail]').should('contain', email);
  });
});
