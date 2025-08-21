import {
  BRANCH_MAIN,
  PATH_CONNECTIONS,
  PATH_ORG,
  PATH_PROJECT,
  PROJECT_ENV_PROD
} from '~common/constants/top';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { makeId } from '~common/functions/make-id';

let testId = '_delete-connection__ok';

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123123';

let orgId = 't' + testId;
let orgName = testId;

let projectId = makeId();
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
          isEmailVerified: true
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
          name: projectName,
          defaultBranch: BRANCH_MAIN,
          remoteType: ProjectRemoteTypeEnum.Managed
        }
      ],
      members: [
        {
          memberId: userId,
          email,
          projectId,
          isAdmin: true,
          isEditor: true,
          isExplorer: true
        }
      ],
      connections: [
        {
          projectId: projectId,
          connectionId: connectionId,
          envId: PROJECT_ENV_PROD,
          type: ConnectionTypeEnum.PostgreSQL,
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
      `${PATH_ORG}/${orgId}/${PATH_PROJECT}/${projectId}/${PATH_CONNECTIONS}`
    );
    cy.get('[data-cy=projectConnectionsDeleteButton]').click();
    cy.get('[data-cy=deleteConnectionDialogDeleteButton]').click();
    cy.loading();
    cy.get('[data-cy=projectConnectionsDeleteButton]').should('have.length', 0);
  });
});
