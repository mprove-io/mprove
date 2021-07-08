import { common } from '~front-e2e/barrels/common';

let testId = '_remove-member__ok';

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

describe('front-e2e', () => {
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
    cy.get('[data-cy=projectTeamRemoveMemberButton]').should('have.length', 2);
    cy.get('[data-cy=projectTeamRemoveMemberButton]').eq(1).click();
    cy.get('[data-cy=removeMemberDialogRemoveButton]').click();
    cy.loading();
    cy.get('[data-cy=projectTeamRemoveMemberButton]').should('have.length', 1);
  });
});
