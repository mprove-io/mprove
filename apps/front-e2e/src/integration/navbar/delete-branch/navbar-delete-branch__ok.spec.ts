import { common } from '~front-e2e/barrels/common';

let testId = '_navbar-delete-branch__ok';

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123123';

let orgId = 't' + testId;
let orgName = testId;

let projectId = common.makeId();
let projectName = testId;

let newBranchName = 'b';

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
      `${common.PATH_ORG}/${orgId}/${common.PATH_PROJECT}/${projectId}/${common.PATH_SETTINGS}`
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
