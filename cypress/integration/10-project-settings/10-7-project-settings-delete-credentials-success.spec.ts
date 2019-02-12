import * as constants from '../../../src/app/constants/_index';

const userId = '10-7-user@example.com';
const password = '123123';

const projectId = 'project_10_7';

describe('10-7 project-settings-delete-credentials-success (logged in)', () => {
  it(`should be able to delete credentials`, () => {
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
    cy.get('[data-cy=projectSettingsEditCredentialsButton]').click();
    cy.get('[data-cy=dialogUpdateCredentialsDeleteCredentialsButton]').click();
    cy.loading();
    cy.get('[data-cy=projectSettingsBigqueryProjectData]').should(
      'have.text',
      ''
    );
    cy.get('[data-cy=projectSettingsBigqueryClientEmailData]').should(
      'have.text',
      ''
    );
  });
});
