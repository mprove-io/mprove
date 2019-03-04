import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '10-08-user@example.com';
const password = '123123';

const projectId = 'project_10_08';

describe('10-08 project-settings-delete-project-success (logged in)', () => {
  it(`should be able to delete project`, () => {
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
          has_credentials: true
        }
      ]
    });
    cy.loginUser({ user_id: userId, password: password });
    cy.basicVisit(`${constants.PATH_PROJECT}/${projectId}/settings`);
    cy.loading();
    cy.get('[data-cy=projectSettingsDeleteButton]').click();
    cy.get('[data-cy=dialogDeleteProjectYesButton]').click();
    cy.loading();
    cy.url().should('include', constants.PATH_PROFILE);
  });
});
