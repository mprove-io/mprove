import { common } from '~integra/barrels/common';

let testId = '_profile-edit-timezone__ok';

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
    cy.visit(common.PATH_PROFILE);
    cy.get('[data-cy=profileEditTimezoneButton]').click();
    cy.get('[data-cy=editTimezoneDialogTitle]');
    cy.get('[data-cy=editTimezoneDialogTimezoneSelect]').click();
    cy.get('.ng-option').eq(1).click();
    cy.get('[data-cy=editTimezoneDialogSaveButton]').click();
    cy.loading();
    cy.get('[data-cy=profileTimezone]').should('contain', common.UTC);
  });
});
