import {
  BRANCH_MAIN,
  PATH_BRANCH,
  PATH_ENV,
  PATH_FILE,
  PATH_FILES,
  PATH_ORG,
  PATH_PROJECT,
  PATH_REPO,
  PROJECT_ENV_PROD
} from '~common/constants/top';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { makeId } from '~common/functions/make-id';

let testId = '_files-tree-actions__ok';

let userId = makeId();
let email = `${testId}@example.com`;
let password = '123123';

let orgId = 't' + testId;
let orgName = testId;

let projectId = makeId();
let projectName = testId;
let testProjectId = 't3';

let commitMessage = 'update';

let text = '123';

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
          testProjectId,
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
      `${PATH_ORG}/${orgId}/${PATH_PROJECT}/${projectId}/${PATH_REPO}/${userId}/${PATH_BRANCH}/${BRANCH_MAIN}/${PATH_ENV}/${PROJECT_ENV_PROD}/${PATH_FILES}/${PATH_FILE}/readme.md`
    );
    cy.loading();

    cy.get('[data-cy=fileEditorSaveButton]').should('be.disabled');
    cy.get('[data-cy=fileEditorCancelButton]').should('be.disabled');
    cy.get('[data-cy=filesCommitButton]').should('be.disabled');
    cy.get('[data-cy=filesPushButton]').should('be.disabled');

    cy.get('[data-cy=fileEditorCodeEditor]').click();

    cy.get('.view-line').contains(text).should('not.exist');

    cy.get('[data-cy=fileEditorCodeEditor]').click();
    cy.focused().clear({ force: true }).type(text);

    cy.get('[data-cy=fileEditorSaveButton]').should('be.enabled');
    cy.get('[data-cy=fileEditorCancelButton]').should('be.enabled');
    cy.get('[data-cy=filesCommitButton]').should('be.disabled');
    cy.get('[data-cy=filesPushButton]').should('be.disabled');

    cy.get('[data-cy=fileEditorSaveButton]').click();
    cy.loading();

    cy.get('[data-cy=fileEditorSaveButton]').should('be.disabled');
    cy.get('[data-cy=fileEditorCancelButton]').should('be.disabled');
    cy.get('[data-cy=filesCommitButton]').should('be.enabled');
    cy.get('[data-cy=filesPushButton]').should('be.disabled');

    cy.get('[data-cy=filesCommitButton]').click();
    cy.get('[data-cy=commitDialogMessageInput]').type(commitMessage);
    cy.get('[data-cy=commitDialogCommitButton]').click();

    cy.loading();

    cy.get('[data-cy=fileEditorSaveButton]').should('be.disabled');
    cy.get('[data-cy=fileEditorCancelButton]').should('be.disabled');
    cy.get('[data-cy=filesCommitButton]').should('be.disabled');
    cy.get('[data-cy=filesPushButton]').should('be.enabled');

    cy.get('[data-cy=filesPushButton]').click();
    cy.loading();

    cy.get('[data-cy=fileEditorSaveButton]').should('be.disabled');
    cy.get('[data-cy=fileEditorCancelButton]').should('be.disabled');
    cy.get('[data-cy=filesCommitButton]').should('be.disabled');
    cy.get('[data-cy=filesPushButton]').should('be.disabled');

    cy.get('.view-line').contains(text).should('exist');
  });
});
