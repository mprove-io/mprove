import * as constants from '../../../src/app/constants/_index';

const userId = '10-04-user@example.com';
const password = '123123';

const projectId = 'project_10_04';

describe('10-04 project-settings-data (logged in)', () => {
  it(`should see data`, () => {
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
    cy.basicVisit(`${constants.PATH_PROJECT}/${projectId}/settings`);
    cy.loading();
    cy.get('[data-cy=projectSettingsTitle]').should('exist');
    cy.get('[data-cy=projectSettingsProjectIdData]').should('have.text', projectId);
  });
});
