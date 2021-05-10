import { common } from '~front-e2e/barrels/common';

let testId = '_edit-project-name__ok';

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123123';

let orgId = 't' + testId;
let orgName = testId;

let projectId = common.makeId();
let projectName = 'p1';
let newProjectName = 'p2';

describe('front-e2e', () => {
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
    cy.get('[data-cy=projectSettingsEditNameButton]').click();
    cy.get('[data-cy=editProjectNameDialogProjectNameInput]')
      .clear({ force: true })
      .type(newProjectName);
    cy.get('[data-cy=editProjectNameDialogSaveButton]').click();
    cy.loading();
    cy.get('[data-cy=projectSettingsName]').should('contain', newProjectName);
  });
});
