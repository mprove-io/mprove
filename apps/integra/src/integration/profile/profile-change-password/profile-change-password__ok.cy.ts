import {
  PATH_PASSWORD_RESET_SENT_AUTH,
  PATH_PROFILE
} from '~common/constants/top';

let testId = '_profile-change-password__ok';

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
    cy.get('[data-cy=profileChangePasswordButton]').click();
    cy.loading();
    cy.url().should('include', PATH_PASSWORD_RESET_SENT_AUTH);
    cy.get('[data-cy=passwordResetSentDoneButton]').click();
    cy.loading();
    cy.url().should('include', PATH_PROFILE);
  });
});
