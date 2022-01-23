import { common } from '~front-e2e/barrels/common';

let testId = '_blockml-tree-revert-repo-to-production__ok';

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123123';

let invitedEmail = `${testId}2@example.com`;

let orgId = 't' + testId;
let orgName = testId;

let projectId = common.makeId();
let projectName = testId;
let testProjectId = 't3';

let text = '123';

describe('front-e2e', () => {
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
      `${common.PATH_ORG}/${orgId}/${common.PATH_PROJECT}/${projectId}/${common.PATH_REPO}/${userId}/${common.PATH_BRANCH}/${common.BRANCH_MASTER}/${common.PATH_FILES}/${common.PATH_FILE}/readme.md`
    );
    cy.loading();

    cy.get('[data-cy=blockmlEditorMonacoEditor]').click();

    cy.get('.view-line').contains('T3').should('exist');
    cy.get('.view-line').contains(text).should('not.exist');

    cy.focused().clear({ force: true }).type(text);

    cy.get('[data-cy=blockmlEditorSaveButton]').click();
    cy.loading();

    cy.get('.view-line').contains('T3').should('not.exist');
    cy.get('.view-line').contains(text).should('exist');

    cy.get('[data-cy=repoOptionsMenuButton]').click();
    cy.get('[data-cy=repoOptionsRevertRepoToProductionButton]').click();
    cy.loading();

    cy.visit(
      `${common.PATH_ORG}/${orgId}/${common.PATH_PROJECT}/${projectId}/${common.PATH_REPO}/${userId}/${common.PATH_BRANCH}/${common.BRANCH_MASTER}/${common.PATH_FILES}/${common.PATH_FILE}/readme.md`
    );
    cy.loading();

    cy.get('.view-line').contains('T3').should('exist');
    cy.get('.view-line').contains(text).should('not.exist');
  });
});
