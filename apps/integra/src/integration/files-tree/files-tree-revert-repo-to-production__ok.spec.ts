import { common } from '~integra/barrels/common';

let testId = '_files-tree-revert-repo-to-remote__ok';

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123123';

let orgId = 't' + testId;
let orgName = testId;

let projectId = common.makeId();
let projectName = testId;
let testProjectId = 't3';

let text = '123';

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
      `${common.PATH_ORG}/${orgId}/${common.PATH_PROJECT}/${projectId}/${common.PATH_REPO}/${userId}/${common.PATH_BRANCH}/${common.BRANCH_MASTER}/${common.PATH_ENV}/${common.PROJECT_ENV_PROD}/${common.PATH_FILES}/${common.PATH_FILE}/readme.md`
    );
    cy.loading();

    cy.get('[data-cy=fileEditorMonacoEditor]').click();

    cy.get('.view-line').contains('T3').should('exist');
    cy.get('.view-line').contains(text).should('not.exist');

    cy.get('[data-cy=fileEditorMonacoEditor]').click();
    cy.focused().clear({ force: true }).type(text);

    cy.get('[data-cy=fileEditorSaveButton]').click();
    cy.loading();

    cy.get('.view-line').contains('T3').should('not.exist');
    cy.get('.view-line').contains(text).should('exist');

    cy.get('[data-cy=repoOptionsMenuButton]').click();
    cy.get('[data-cy=repoOptionsRevertRepoToRemoteButton]').click();
    cy.loading();

    cy.visit(
      `${common.PATH_ORG}/${orgId}/${common.PATH_PROJECT}/${projectId}/${common.PATH_REPO}/${userId}/${common.PATH_BRANCH}/${common.BRANCH_MASTER}/${common.PATH_ENV}/${common.PROJECT_ENV_PROD}/${common.PATH_FILES}/${common.PATH_FILE}/readme.md`
    );
    cy.loading();

    cy.get('.view-line').contains('T3').should('exist');
    cy.get('.view-line').contains(text).should('not.exist');
  });
});
