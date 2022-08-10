import { common } from '~integra/barrels/common';

let testId = '_confirm-email__ok-already';

let email = `${testId}@example.com`;
let password = '123123';
let emailVerificationToken = common.makeId();

describe('integra', () => {
  it(testId, () => {
    cy.deletePack({ emails: [email] });
    cy.seedPack({
      users: [
        {
          email: email,
          password: password,
          isEmailVerified: common.BoolEnum.TRUE,
          emailVerificationToken: emailVerificationToken
        }
      ]
    });
    cy.visit(common.PATH_CONFIRM_EMAIL + '?token=' + emailVerificationToken);
    cy.loading();
    cy.url().should('include', common.PATH_EMAIL_CONFIRMED);
    cy.get('[data-cy=emailIsConfirmedTitle]');
  });
});
