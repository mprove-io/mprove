import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';
import * as enums from '../../../src/app/enums/_index';

const userId = '12-03-user-a@example.com';
const secondUserId = '12-03-user-b@example.com';
const password = '123123';

const projectId = 'project_12_03';

describe('12-03 blockml-chain-of-actions (logged in)', () => {
  it(`should handle chain of actions`, () => {
    cy.deletePack({
      user_ids: [userId, secondUserId],
      project_ids: [projectId]
    });
    cy.seedPack({
      users: [
        {
          user_id: userId,
          password: password,
          email_verified: true
        },
        {
          user_id: secondUserId,
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
        },
        {
          project_id: projectId,
          member_id: secondUserId,
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

    cy.get('[data-cy=spaceModeToggleInput]').should('be.enabled');
    cy.get('[data-cy=blockmlFileEditorSaveButton]').should('be.disabled');
    cy.get('[data-cy=blockmlHintTitle]').should('exist');
    cy.get('[data-cy=blockmlCommitButton]').should('be.disabled');
    cy.get('[data-cy=blockmlPullButton]').should('not.be.visible');
    cy.get('[data-cy=blockmlPushToProductionButton]').should('be.disabled');
    cy.get('[data-cy=blockmlOptionsButton]').should('be.enabled');

    cy.get('[data-cy=blockmlFileEditorCodeEditor]').click();
    cy.focused().type(' 123');

    cy.get('[data-cy=spaceModeToggleInput]').should('be.disabled');
    cy.get('[data-cy=blockmlFileEditorSaveButton]').should('be.enabled');
    cy.get('[data-cy=blockmlHintTitle]').should('exist');
    cy.get('[data-cy=blockmlCommitButton]').should('be.disabled');
    cy.get('[data-cy=blockmlPullButton]').should('not.be.visible');
    cy.get('[data-cy=blockmlPushToProductionButton]').should('be.disabled');
    cy.get('[data-cy=blockmlOptionsButton]').should('be.disabled');

    // save
    cy.get('[data-cy=blockmlFileEditorSaveButton]').click();
    cy.loading();

    cy.get('[data-cy=spaceModeToggleInput]').should('be.enabled');
    cy.get('[data-cy=blockmlFileEditorSaveButton]').should('be.disabled');
    cy.get('[data-cy=blockmlHintTitle]').should('exist');
    cy.get('[data-cy=blockmlCommitButton]').should('be.enabled');
    cy.get('[data-cy=blockmlPullButton]').should('not.be.visible');
    cy.get('[data-cy=blockmlPushToProductionButton]').should('be.disabled');
    cy.get('[data-cy=blockmlOptionsButton]').should('be.enabled');
    cy.get('.view-line')
      .contains('123')
      .should('exist');

    // commit
    cy.get('[data-cy=blockmlCommitButton]').click();
    cy.loading();

    cy.get('[data-cy=blockmlFileEditorSaveButton]').should('be.disabled');
    cy.get('[data-cy=blockmlHintTitle]').should('exist');
    cy.get('[data-cy=blockmlCommitButton]').should('be.disabled');
    cy.get('[data-cy=blockmlPullButton]').should('not.be.visible');
    cy.get('[data-cy=blockmlPushToProductionButton]').should('be.enabled');
    cy.get('[data-cy=blockmlOptionsButton]').should('be.enabled');

    // push to production
    cy.get('[data-cy=blockmlPushToProductionButton]').click();
    cy.loading();

    cy.get('[data-cy=blockmlFileEditorSaveButton]').should('be.disabled');
    cy.get('[data-cy=blockmlHintTitle]').should('exist');
    cy.get('[data-cy=blockmlCommitButton]').should('be.disabled');
    cy.get('[data-cy=blockmlPullButton]').should('not.be.visible');
    cy.get('[data-cy=blockmlPushToProductionButton]').should('be.disabled');
    cy.get('[data-cy=blockmlOptionsButton]').should('be.enabled');

    cy.clearLocalStorage();
    cy.url().should('include', constants.PATH_LOGIN);
    cy.loginUser({ user_id: secondUserId, password: password });

    cy.basicVisit(
      `${constants.PATH_PROJECT}/${projectId}/${constants.PATH_MODE}/${
        enums.LayoutModeEnum.Dev
      }/${constants.PATH_BLOCKML}/file/readme.md`
    );
    cy.loading();
    cy.get('.view-line').contains(projectId);

    cy.get('[data-cy=blockmlFileEditorCodeEditor]').click();
    cy.focused().type(' 456');

    cy.get('[data-cy=blockmlFileEditorSaveButton]').click();
    cy.loading();

    cy.get('[data-cy=blockmlCommitButton]').click();
    cy.loading();

    cy.get('[data-cy=blockmlFileEditorSaveButton]').should('be.disabled');
    cy.get('[data-cy=blockmlHintTitle]').should('exist');
    cy.get('[data-cy=blockmlCommitButton]').should('be.disabled');
    cy.get('[data-cy=blockmlPullButton]').should('be.enabled');
    cy.get('[data-cy=blockmlPushToProductionButton]').should('be.disabled');
    cy.get('[data-cy=blockmlOptionsButton]').should('be.enabled');

    // pull
    cy.get('[data-cy=blockmlPullButton]').click();
    cy.loading();

    cy.get('[data-cy=blockmlFileEditorSaveButton]').should('be.disabled');
    cy.get('[data-cy=blockmlConflictsTitle]').should('exist');
    cy.get('[data-cy=blockmlCommitButton]').should('be.disabled');
    cy.get('[data-cy=blockmlPullButton]').should('not.be.visible');
    cy.get('[data-cy=blockmlPushToProductionButton]').should('be.disabled');
    cy.get('[data-cy=blockmlOptionsButton]').should('be.enabled');

    cy.get('[data-cy=blockmlConflictLine]').click();
    cy.url().should('include', '?line=1');

    // revert to production
    cy.get('[data-cy=blockmlOptionsButton]').click();
    cy.get('[data-cy=blockmlRevertRepoToProductionButton]').click();
    cy.loading();

    cy.get('.view-line')
      .contains('123')
      .should('exist');

    cy.get('[data-cy=blockmlFileEditorSaveButton]').should('be.disabled');
    cy.get('[data-cy=blockmlHintTitle]').should('exist');
    cy.get('[data-cy=blockmlCommitButton]').should('be.disabled');
    cy.get('[data-cy=blockmlPullButton]').should('not.be.visible');
    cy.get('[data-cy=blockmlPushToProductionButton]').should('be.disabled');
    cy.get('[data-cy=blockmlOptionsButton]').should('be.enabled');
  });
});
