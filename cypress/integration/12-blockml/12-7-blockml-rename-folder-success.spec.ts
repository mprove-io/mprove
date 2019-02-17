import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';
import * as enums from '../../../src/app/enums/_index';

const userId = '12-7-user@example.com';
const password = '123123';

const projectId = 'project_12_7';

describe('12-7 blockml-rename-folder-success (logged in)', () => {
  it(`should be able to rename folder`, () => {
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
      }/${constants.PATH_BLOCKML}`
    );
    cy.loading();
    cy.get('[data-cy=blockmlTreeFolderOptionsButton]')
      .eq(3)
      .invoke('show')
      .click();
    cy.get('[data-cy=blockmlTreeFolderOptionsRenameFolderButton]').click();
    cy.get('[data-cy=dialogRenameFolderNameInput]').type('fd-b');
    cy.get('[data-cy=dialogRenameFolderSaveButton]').click();
    cy.loading();
    cy.contains('fd-b').should('exist');
    cy.get('[data-cy=blockmlHintTitle]').should('exist');
    cy.get('[data-cy=blockmlCommitButton]').should('be.enabled');
    cy.get('[data-cy=blockmlPullButton]').should('not.be.visible');
    cy.get('[data-cy=blockmlPushToProductionButton]').should('be.disabled');
    cy.get('[data-cy=blockmlOptionsButton]').should('be.enabled');   
  });
});
