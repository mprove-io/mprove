import { common } from '~front-e2e/barrels/common';

let testId = '_edit-company-size__ok';

let email = `${testId}@example.com`;
let password = '123123';

let orgId = 't' + testId;
let orgName = testId;

describe('front-e2e', () => {
  it(testId, () => {
    cy.deletePack({
      emails: [email],
      orgIds: [orgId]
    });
    cy.seedPack({
      users: [
        {
          email: email,
          password: password,
          isEmailVerified: common.BoolEnum.TRUE
        }
      ],
      orgs: [
        {
          orgId: orgId,
          ownerEmail: email,
          name: orgName
        }
      ]
    });
    cy.loginUser({ email: email, password: password });
    cy.visit(`${common.PATH_ORG}/${orgId}/${common.PATH_ORG_ACCOUNT}`);
    cy.get('[data-cy=orgAccountEditCompanySizeButton]').click();
    cy.get('[data-cy=editCompanySizeDialogTimezoneSelect]').click();
    cy.get('.ng-option').eq(1).click();
    cy.get('[data-cy=editCompanySizeDialogSaveButton]').click();
    cy.loading();
    cy.get('[data-cy=orgAccountCompanySize]').should(
      'contain',
      common.CompanySizeEnum.TenToFifty
    );
  });
});
