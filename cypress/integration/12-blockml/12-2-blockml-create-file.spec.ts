import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';
import * as enums from '../../../src/app/enums/_index';

const userId = '12-2-user@example.com';
const password = '123123';

const projectId = 'project_12_2';

describe('12-2 blockml-data (logged in)', () => {
  it(`should be able to create file`, () => {
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
    .eq(1)
    .invoke('show')
    .click();
    cy.get('[data-cy=blockmlTreeFolderOptionsNewFileButton]').click();
    cy.get('[data-cy=dialogNewFileNameInput]').type('sales.view');
    cy.get('[data-cy=dialogNewFileDialogCreateButton]').click();
    cy.loading();
  });
});
