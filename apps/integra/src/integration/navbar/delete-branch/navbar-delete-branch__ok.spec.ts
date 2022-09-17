import { common } from '~integra/barrels/common';

let testId = '_navbar-delete-branch__ok';

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123123';

let orgId = 't' + testId;
let orgName = testId;

let projectId = common.makeId();
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
          name: projectName,
          defaultBranch: common.BRANCH_MASTER,
          remoteType: common.ProjectRemoteTypeEnum.Managed
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
      `${common.PATH_ORG}/${orgId}/${common.PATH_PROJECT}/${projectId}/${common.PATH_REPO}/${userId}/${common.PATH_BRANCH}/${common.BRANCH_MASTER}/${common.PATH_FILES}`
    );
    cy.get('[data-cy=branchSelect]').click();
    cy.get('[data-cy=branchSelectCreateBranchButton]').click();
    cy.get('[data-cy=createBranchDialogBranchIdInput]').type(newBranchName);
    cy.get('[data-cy=createBranchDialogCreateButton]').click();
    cy.loading();
    cy.get('[data-cy=branchSelect]').click();
    cy.get('[data-cy=branchSelectDeleteBranchButton]').click();
    cy.get('[data-cy=deleteBranchDialogDeleteButton]').click();
    cy.url().should('include', common.BRANCH_MASTER);
  });
});
