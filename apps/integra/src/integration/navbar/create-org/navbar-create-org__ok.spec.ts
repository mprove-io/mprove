import { common } from '~integra/barrels/common';

let testId = '_navbar-create-org__ok';

let email = `${testId}@example.com`;
let password = '123123';

let orgName = testId;

describe('integra', () => {
  it(testId, () => {
    cy.deletePack({
      emails: [email],
      orgNames: [orgName]
    });
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
    cy.get('[data-cy=orgSelect]').click();
    cy.get('[data-cy=orgSelectCreateOrgButton]').click();
    cy.get('[data-cy=createOrgDialogOrgNameInput]').type(orgName);
    cy.get('[data-cy=createOrgDialogCreateButton]').click();
    cy.loading();
    cy.get('[data-cy=orgAccountTitle]').should('exist');
  });
});
