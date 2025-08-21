import {
  BRANCH_MAIN,
  PATH_CONNECTIONS,
  PATH_ORG,
  PATH_PROJECT
} from '~common/constants/top';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { makeId } from '~common/functions/make-id';

let testId = '_add-connection__ok-bigquery';

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123123';

let orgId = 't' + testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

let bigqueryTestCredentials: any;

describe('integra', () => {
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
          defaultBranch: BRANCH_MAIN,
          remoteType: ProjectRemoteTypeEnum.Managed
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
      `${PATH_ORG}/${orgId}/${PATH_PROJECT}/${projectId}/${PATH_CONNECTIONS}`
    );
    cy.get('[data-cy=projectConnectionsAddConnectionButton]').click();
    cy.get('[data-cy=addConnectionDialogConnectionIdInput]').type('c1');
    cy.get('[data-cy=addConnectionDialogTypeSelect]').click();
    cy.get('.ng-option').eq(1).click();
    cy.get('[data-cy=addConnectionDialogServiceAccountCredentialsInput]').type(
      bigqueryTestCredentials
    );
    cy.get('[data-cy=addConnectionDialogBigqueryQuerySizeLimitGbInput]').type(
      '3'
    );
    cy.get('[data-cy=addConnectionDialogAddButton]').click();
    cy.loading();
    cy.get('[data-cy=projectConnectionsDeleteButton]').should('have.length', 1);
  });
});
