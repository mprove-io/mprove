import { common } from '~integra/barrels/common';

let testId = '_edit-project-name__ok';

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123123';

let orgId = 't' + testId;
let orgName = testId;

let projectId = common.makeId();
let projectName = testId;
let newProjectName = 'p2';

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
          defaultBranch: common.BRANCH_MASTER,
          remoteType: common.ProjectRemoteTypeEnum.Managed
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
      `${common.PATH_ORG}/${orgId}/${common.PATH_PROJECT}/${projectId}/${common.PATH_SETTINGS}`
    );
    cy.get('[data-cy=projectSettingsEditNameButton]').click();
    cy.get('[data-cy=editProjectNameDialogProjectNameInput]')
      .clear({ force: true })
      .type(newProjectName);
    cy.get('[data-cy=editProjectNameDialogSaveButton]').click();
    cy.loading();
    cy.get('[data-cy=projectSettingsName]').should(
      'contain',
      common.capitalizeFirstLetter(newProjectName)
    );
  });
});
