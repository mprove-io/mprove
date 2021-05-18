import { common } from '~front-e2e/barrels/common';

let testId = '_navbar-create-project__ok';

let email = `${testId}@example.com`;
let password = '123123';

let orgId = 't' + testId;
let orgName = testId;

let projectName = 'p1';

describe('front-e2e', () => {
  it(testId, () => {
    cy.deletePack({
      emails: [email],
      orgNames: [orgName],
      orgIds: [orgId],
      projectNames: [projectName]
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
    cy.visit(`${common.PATH_ORG}/${orgId}/${common.PATH_ACCOUNT}`);
    cy.get('[data-cy=projectSelect]').click();
    cy.get('[data-cy=projectSelectCreateProjectButton]').click();
    cy.get('[data-cy=createProjectDialogProjectNameInput]').type(projectName);
    cy.get('[data-cy=createProjectDialogCreateButton]').click();
    cy.loading();
    cy.get('[data-cy=projectSettingsTitle]').should('exist');
  });
});
