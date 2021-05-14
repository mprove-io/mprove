import { common } from '~front-e2e/barrels/common';

let testId = '_edit-connection__ok';

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123123';

let orgId = 't' + testId;
let orgName = testId;

let projectId = common.makeId();
let projectName = 'p1';

let connectionId = 'c1';

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
      ],
      connections: [
        {
          projectId: projectId,
          connectionId: connectionId,
          type: common.ConnectionTypeEnum.PostgreSQL,
          postgresHost: '1',
          postgresPort: 2,
          postgresDatabase: '3',
          postgresUser: '4',
          postgresPassword: '5'
        }
      ]
    });
    cy.loginUser({ email: email, password: password });
    cy.visit(
      `${common.PATH_ORG}/${orgId}/${common.PATH_PROJECT}/${projectId}/${common.PATH_CONNECTIONS}`
    );
    cy.get('[data-cy=projectConnectionsEditButton]').click();
    cy.get('[data-cy=editConnectionDialogPostgresHostInput]')
      .clear({ force: true })
      .type('10');
    cy.get('[data-cy=editConnectionDialogPostgresPortInput]')
      .clear({ force: true })
      .type('20');
    cy.get('[data-cy=editConnectionDialogPostgresDatabaseInput]')
      .clear({ force: true })
      .type('30');
    cy.get('[data-cy=editConnectionDialogPostgresUserInput]')
      .clear({ force: true })
      .type('40');
    cy.get('[data-cy=editConnectionDialogPostgresPasswordInput]')
      .clear({ force: true })
      .type('50');
    cy.get('[data-cy=editConnectionDialogSaveButton]').click();
    cy.loading();
    cy.get('[data-cy=projectConnectionsHost]').should('contain', '10');
  });
});
