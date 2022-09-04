import { common } from '~integra/barrels/common';

let testId = '_delete-connection__ok';

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123123';

let orgId = 't' + testId;
let orgName = testId;

let projectId = common.makeId();
let projectName = testId;

let connectionId = 'c1';

describe('integra', () => {
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
      ],
      connections: [
        {
          projectId: projectId,
          connectionId: connectionId,
          type: common.ConnectionTypeEnum.PostgreSQL,
          host: '1',
          port: 2,
          database: '3',
          username: '4',
          password: '5'
        }
      ]
    });
    cy.loginUser({ email: email, password: password });
    cy.visit(
      `${common.PATH_ORG}/${orgId}/${common.PATH_PROJECT}/${projectId}/${common.PATH_CONNECTIONS}`
    );
    cy.get('[data-cy=projectConnectionsDeleteButton]').click();
    cy.get('[data-cy=deleteConnectionDialogDeleteButton]').click();
    cy.loading();
    cy.get('[data-cy=projectConnectionsDeleteButton]').should('have.length', 0);
  });
});
