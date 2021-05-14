import { common } from '~front-e2e/barrels/common';

let testId = '_add-connection__ok-postgres';

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123123';

let orgId = 't' + testId;
let orgName = testId;

let projectId = common.makeId();
let projectName = 'p1';

describe('front-e2e', () => {
  it(testId, () => {
    cy.deletePack({
      emails: [email],
      orgIds: [orgId],
      projectIds: [projectId],
      projectNames: [projectName]
    });
    cy.seedPack({
      users: [
        {
          userId,
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
      ],
      projects: [
        {
          orgId,
          projectId,
          name: projectName
        }
      ],
      members: [
        {
          memberId: userId,
          email,
          projectId,
          isAdmin: common.BoolEnum.TRUE,
          isEditor: common.BoolEnum.TRUE,
          isExplorer: common.BoolEnum.TRUE
        }
      ]
    });
    cy.loginUser({ email: email, password: password });
    cy.visit(
      `${common.PATH_ORG}/${orgId}/${common.PATH_PROJECT}/${projectId}/${common.PATH_CONNECTIONS}`
    );
    cy.get('[data-cy=projectConnectionsAddConnectionButton]').click();
    cy.get('[data-cy=addConnectionDialogConnectionIdInput]').type('c1');
    cy.get('[data-cy=addConnectionDialogTypeSelect]').click();
    cy.get('.ng-option').eq(0).click();
    cy.get('[data-cy=addConnectionDialogPostgresHostInput]').type('1');
    cy.get('[data-cy=addConnectionDialogPostgresPortInput]').type('2');
    cy.get('[data-cy=addConnectionDialogPostgresDatabaseInput]').type('3');
    cy.get('[data-cy=addConnectionDialogPostgresUserInput]').type('4');
    cy.get('[data-cy=addConnectionDialogPostgresPasswordInput]').type('5');
    cy.get('[data-cy=addConnectionDialogAddButton]').click();
    cy.loading();
    cy.get('[data-cy=projectConnectionsDeleteButton]').should('have.length', 1);
  });
});
