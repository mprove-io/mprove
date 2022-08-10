import { apiToBackend } from '~integra/barrels/api-to-backend';
import { common } from '~integra/barrels/common';

let testId = '_confirm-email__register-to-set-password';

let email = `${testId}@example.com`;
let emailVerificationToken = common.makeId();

let errorMessage = common.transformErrorMessage(
  apiToBackend.ErEnum.BACKEND_REGISTER_TO_SET_PASSWORD
);

describe('integra', () => {
  it(testId, () => {
    cy.deletePack({ emails: [email] });
    cy.seedPack({
      users: [
        {
          email: email,
          isEmailVerified: common.BoolEnum.FALSE,
          emailVerificationToken: emailVerificationToken
        }
      ]
    });
    cy.visit(common.PATH_CONFIRM_EMAIL + '?token=' + emailVerificationToken);
    cy.loading();
    cy.get('[data-cy=errorDialogMessage]').should('contain', errorMessage);
  });
});
