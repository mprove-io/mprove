import { common } from '~front-e2e/barrels/common';

let testId = '_confirm-email__ok-first';
let email = `${testId}@example.com`;
let password = '123123';
let emailVerificationToken = common.makeId();

describe('front-e2e', () => {
  it(testId, () => {
    cy.deletePack({ emails: [email] });
    cy.seedPack({
      users: [
        {
          email: email,
          password: password,
          isEmailVerified: common.BoolEnum.FALSE,
          emailVerificationToken: emailVerificationToken
        }
      ]
    });
    cy.visit(common.PATH_CONFIRM_EMAIL + '?token=' + emailVerificationToken);
    cy.loading();
    cy.url().should('include', common.PATH_PROFILE);
    cy.get('[data-cy=emailIsConfirmedDialog]');
  });
});
