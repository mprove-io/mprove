import { common } from '~integra/barrels/common';

let testId = '_edit-member__ok';

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123123';

let secondUserId = common.makeId();
let secondEmail = `${testId}2@example.com`;
let secondPassword = '123123';

let orgId = 't' + testId;
let orgName = testId;

let projectId = common.makeId();
let projectName = testId;

describe('integra', () => {
  it(testId, () => {
    cy.deletePack({
      emails: [email, secondEmail],
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
        },
        {
          userId: secondUserId,
          email: secondEmail,
          password: secondPassword,
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
        },
        {
          memberId: secondUserId,
          email: secondEmail,
          projectId,
          isAdmin: common.BoolEnum.TRUE,
          isEditor: common.BoolEnum.TRUE,
          isExplorer: common.BoolEnum.TRUE
        }
      ]
    });
    cy.loginUser({ email: email, password: password });
    cy.visit(
      `${common.PATH_ORG}/${orgId}/${common.PATH_PROJECT}/${projectId}/${common.PATH_TEAM}`
    );

    cy.get('[data-cy=projectTeamIsAdminButton]')
      .eq(1)
      .should('have.class', 'bg-blue3');
    cy.get('[data-cy=projectTeamIsAdminButton]').eq(1).click();
    cy.loading();
    cy.get('[data-cy=projectTeamIsAdminButton]')
      .eq(1)
      .should('not.have.class', 'bg-blue3');

    cy.get('[data-cy=projectTeamIsEditorButton]')
      .eq(1)
      .should('have.class', 'bg-blue3');
    cy.get('[data-cy=projectTeamIsEditorButton]').eq(1).click();
    cy.loading();
    cy.get('[data-cy=projectTeamIsEditorButton]')
      .eq(1)
      .should('not.have.class', 'bg-blue3');

    cy.get('[data-cy=projectTeamIsExplorerButton]')
      .eq(1)
      .should('have.class', 'bg-blue3');
    cy.get('[data-cy=projectTeamIsExplorerButton]').eq(1).click();
    cy.loading();
    cy.get('[data-cy=projectTeamIsExplorerButton]')
      .eq(1)
      .should('not.have.class', 'bg-blue3');
  });
});
