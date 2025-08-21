import {
  BRANCH_MAIN,
  PATH_ORG,
  PATH_PROJECT,
  PATH_TEAM
} from '~common/constants/top';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { makeId } from '~common/functions/make-id';

let testId = '_remove-member__ok';

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123123';

let secondUserId = makeId();
let secondEmail = `${testId}2@example.com`;
let secondPassword = '123123';

let orgId = 't' + testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

describe('integra', () => {
  it(testId, () => {
    cy.deletePack({
      emails: [email, secondEmail],
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
        },
        {
          userId: secondUserId,
          email: secondEmail,
          password: secondPassword,
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
        },
        {
          memberId: secondUserId,
          email: secondEmail,
          projectId,
          isAdmin: true,
          isEditor: true,
          isExplorer: true
        }
      ]
    });
    cy.loginUser({ email: email, password: password });
    cy.visit(`${PATH_ORG}/${orgId}/${PATH_PROJECT}/${projectId}/${PATH_TEAM}`);
    cy.get('[data-cy=projectTeamRemoveMemberButton]').should('have.length', 2);
    cy.get('[data-cy=projectTeamRemoveMemberButton]').eq(1).click();
    cy.get('[data-cy=removeMemberDialogRemoveButton]').click();
    cy.loading();
    cy.get('[data-cy=projectTeamRemoveMemberButton]').should('have.length', 1);
  });
});
