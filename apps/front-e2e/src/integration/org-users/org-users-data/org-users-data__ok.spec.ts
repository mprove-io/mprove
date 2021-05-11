import { common } from '~front-e2e/barrels/common';

let testId = '_org-users-data__ok';

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123123';

let secondUserId = common.makeId();
let secondEmail = `${testId}2@example.com`;
let secondPassword = '123123';

let orgId = 't' + testId;
let orgName = testId;

let projectId = common.makeId();
let projectName = 'p1';

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
          userId: userId,
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
    cy.visit(`${common.PATH_ORG}/${orgId}/${common.PATH_USERS}`);
    cy.get(`[data-cy=orgUsersTitle]`);
    cy.get('[data-cy=orgUsersUserEmailData]').should('have.length', 2);
  });
});
