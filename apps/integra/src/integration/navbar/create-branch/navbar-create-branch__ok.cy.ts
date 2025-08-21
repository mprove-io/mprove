import {
  BRANCH_MAIN,
  PATH_BRANCH,
  PATH_ENV,
  PATH_FILES,
  PATH_ORG,
  PATH_PROJECT,
  PATH_REPO,
  PROJECT_ENV_PROD
} from '~common/constants/top';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { makeId } from '~common/functions/make-id';

let testId = '_navbar-create-branch__ok';

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123123';

let orgId = 't' + testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

let newBranchName = 'b';

describe('integra', () => {
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
      ]
    });
    cy.loginUser({ email: email, password: password });
    cy.visit(
      `${PATH_ORG}/${orgId}/${PATH_PROJECT}/${projectId}/${PATH_REPO}/${userId}/${PATH_BRANCH}/${BRANCH_MAIN}/${PATH_ENV}/${PROJECT_ENV_PROD}/${PATH_FILES}`
    );
    cy.get('[data-cy=branchSelect]').click();
    cy.get('[data-cy=branchSelectCreateBranchButton]').click();
    cy.get('[data-cy=createBranchDialogBranchIdInput]').type(newBranchName);
    cy.get('[data-cy=createBranchDialogCreateButton]').click();
    cy.loading();
    cy.get('[data-cy=filesTitle]').should('exist');
  });
});
