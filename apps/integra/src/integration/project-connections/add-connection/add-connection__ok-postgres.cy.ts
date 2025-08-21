import {
  BRANCH_MAIN,
  PATH_CONNECTIONS,
  PATH_ORG,
  PATH_PROJECT
} from '~common/constants/top';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { makeId } from '~common/functions/make-id';

let testId = '_add-connection__ok-postgres';

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123123';

let orgId = 't' + testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;

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
    cy.get('.ng-option').eq(3).click();
    cy.get('[data-cy=addConnectionDialogHostInput]').type('1');
    cy.get('[data-cy=addConnectionDialogPortInput]').type('2');
    cy.get('[data-cy=addConnectionDialogDatabaseInput]').type('3');
    cy.get('[data-cy=addConnectionDialogUserInput]').type('4');
    cy.get('[data-cy=addConnectionDialogPasswordInput]').type('5');
    cy.get('[data-cy=addConnectionDialogAddButton]').click();
    cy.loading();
    cy.get('[data-cy=projectConnectionsDeleteButton]').should('have.length', 1);
  });
});
