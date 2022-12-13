import { common } from '~integra/barrels/common';

let testId = '_files-tree-rename-file__ok';

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123123';

let orgId = 't' + testId;
let orgName = testId;

let projectId = common.makeId();
let projectName = testId;
let testProjectId = 't3';

let newFileName = 'v3.view';

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
    cy.get('[data-cy=fileOptionsMenuButton]').eq(1).click({ force: true });
    cy.get('[data-cy=fileOptionsRenameFileButton]').click({ force: true });
    cy.get('[data-cy=renameFileDialogFileNameInput]')
      .clear({ force: true })
      .type(newFileName);
    cy.get('[data-cy=renameFileDialogSaveButton]').click();
    cy.loading();
    cy.get('[data-cy=filesTreeItem]').eq(3).should('contain', newFileName);
    cy.url().should('include', `${newFileName}`);
  });
});
