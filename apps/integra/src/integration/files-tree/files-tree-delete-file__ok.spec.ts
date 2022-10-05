import { common } from '~integra/barrels/common';

let testId = '_files-tree-delete-file__ok';

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123123';

let invitedEmail = `${testId}2@example.com`;

let orgId = 't' + testId;
let orgName = testId;

let projectId = common.makeId();
let projectName = testId;
let testProjectId = 't3';

describe('integra', () => {
  it(testId, () => {
    cy.deletePack({
      emails: [email, invitedEmail],
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
          testProjectId,
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
      `${common.PATH_ORG}/${orgId}/${common.PATH_PROJECT}/${projectId}/${common.PATH_REPO}/${userId}/${common.PATH_BRANCH}/${common.BRANCH_MASTER}/${common.PATH_ENV}/${common.PROJECT_ENV_PROD}/${common.PATH_FILES}`
    );
    cy.loading();
    cy.get('[data-cy=filesTreeItem]').should('have.length', 4);
    cy.get('[data-cy=fileOptionsMenuButton]').eq(1).click({ force: true });
    cy.get('[data-cy=fileOptionsDeleteFileButton]').click({ force: true });
    cy.get('[data-cy=deleteFileDialogDeleteButton]').click();
    cy.loading();
    cy.get('[data-cy=filesTreeItem]').should('have.length', 3);
  });
});
