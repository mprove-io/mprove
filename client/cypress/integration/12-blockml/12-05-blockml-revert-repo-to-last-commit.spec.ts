import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';
import * as enums from '../../../src/app/enums/_index';

const userId = '12-05-user@example.com';
const password = '123123';

const projectId = 'project_12_05';

describe('12-05 blockml-revert-repo-to-last-commit (logged in)', () => {
  it(`should be able to revert to last commit`, () => {
    cy.deletePack({
      user_ids: [userId],
      project_ids: [projectId]
    });
    cy.seedPack({
      users: [
        {
          user_id: userId,
          password: password,
          email_verified: true
        }
      ],
      members: [
        {
          project_id: projectId,
          member_id: userId,
          is_admin: true,
          is_editor: true
        }
      ],
      projects: [
        {
          project_id: projectId,
          has_credentials: false
        }
      ]
    });
    cy.loginUser({ user_id: userId, password: password });
    cy.basicVisit(
      `${constants.PATH_PROJECT}/${projectId}/${constants.PATH_MODE}/${
        enums.LayoutModeEnum.Dev
      }/${constants.PATH_BLOCKML}/file/readme.md`
    );
    cy.loading();
    cy.get('.view-line').contains(projectId);

    cy.get('[data-cy=blockmlFileEditorCodeEditor]').click();
    cy.focused().type(' 123');

    cy.get('[data-cy=blockmlFileEditorSaveButton]').click();
    cy.loading();

    cy.get('.view-line')
      .contains('123')
      .should('exist');

    cy.get('[data-cy=blockmlOptionsButton]').click();
    cy.get('[data-cy=blockmlRevertRepoToLastCommitButton]').click();
    cy.loading();

    cy.get('.view-line')
      .contains('123')
      .should('not.exist');

    cy.get('[data-cy=blockmlFileEditorSaveButton]').should('be.disabled');
    cy.get('[data-cy=blockmlHintTitle]').should('exist');
    cy.get('[data-cy=blockmlCommitButton]').should('be.disabled');
    cy.get('[data-cy=blockmlPullButton]').should('not.be.visible');
    cy.get('[data-cy=blockmlPushToProductionButton]').should('be.disabled');
    cy.get('[data-cy=blockmlOptionsButton]').should('be.enabled');
  });
});
