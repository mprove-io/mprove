import { common } from '~front-e2e/barrels/common';

let testId = '_blockml-tree-create-file__ok';

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123123';

let invitedEmail = `${testId}2@example.com`;

let orgId = 't' + testId;
let orgName = testId;

let projectId = common.makeId();
let projectName = 'p1';

let fileName = 'sales';

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
      `${common.PATH_ORG}/${orgId}/${common.PATH_PROJECT}/${projectId}/${common.PATH_REPO}/${userId}/${common.PATH_BRANCH}/${common.BRANCH_MASTER}/${common.PATH_BLOCKML}`
    );
    cy.loading();
    cy.get('[data-cy=blockmlTreeItem]').eq(0).trigger('mouseover');
    cy.get('[data-cy=folderOptionsMenuButton]').click({ force: true });
    cy.get('[data-cy=folderOptionsNewFileButton]').click({ force: true });
    cy.get('[data-cy=createFileDialogFileNameInput]').type(fileName);
    cy.get('[data-cy=typeSelect]').click();
    cy.get('.ng-option').eq(0).click();
    cy.get('[data-cy=createFileDialogCreateButton]').click();
    cy.loading();
    cy.url().should('include', `${fileName}.view`);
  });
});
