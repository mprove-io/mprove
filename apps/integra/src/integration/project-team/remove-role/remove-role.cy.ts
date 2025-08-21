import {
  BRANCH_MAIN,
  PATH_ORG,
  PATH_PROJECT,
  PATH_TEAM
} from '~common/constants/top';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { makeId } from '~common/functions/make-id';

let testId = '_remove-role__ok';

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123123';

let orgId = 't' + testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

let roleName = 'r1';

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
          isExplorer: true,
          roles: [roleName]
        }
      ]
    });
    cy.loginUser({ email: email, password: password });
    cy.visit(`${PATH_ORG}/${orgId}/${PATH_PROJECT}/${projectId}/${PATH_TEAM}`);
    cy.get('[data-cy=projectTeamRemoveRoleButton]').should('have.length', 1);
    cy.get('[data-cy=projectTeamRemoveRoleButton]').click();
    cy.loading();
    cy.get('[data-cy=projectTeamRemoveRoleButton]').should('have.length', 0);
  });
});
