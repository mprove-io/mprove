import { common } from '~front-e2e/barrels/common';

let testId = '_add-connection__ok-bigquery';

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123123';

let orgId = 't' + testId;
let orgName = testId;

let projectId = common.makeId();
let projectName = 'p1';

let bigqueryTestCredentials: any;

describe('front-e2e', () => {
  before(function () {
    cy.fixture('bigquery.txt').then(function (data) {
      bigqueryTestCredentials = data;
    });
  });

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
      `${common.PATH_ORG}/${orgId}/${common.PATH_PROJECT}/${projectId}/${common.PATH_CONNECTIONS}`
    );
    cy.get('[data-cy=projectConnectionsAddConnectionButton]').click();
    cy.get('[data-cy=addConnectionDialogConnectionIdInput]').type('c1');
    cy.get('[data-cy=addConnectionDialogTypeSelect]').click();
    cy.get('.ng-option').eq(1).click();
    cy.get('[data-cy=addConnectionDialogBigqueryCredentialsInput]').type(
      bigqueryTestCredentials
    );
    cy.get('[data-cy=addConnectionDialogBigqueryQuerySizeLimitGbInput]').type(
      '3'
    );
    cy.get('[data-cy=addConnectionDialogAddButton]').click();
    cy.loading();
    cy.get('[data-cy=projectConnectionsDeleteConnectionButton]').should(
      'have.length',
      1
    );
  });
});
