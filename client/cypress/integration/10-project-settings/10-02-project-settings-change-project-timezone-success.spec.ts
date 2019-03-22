import * as constants from '../../../src/app/constants/_index';

const userId = '10-02-user@example.com';
const password = '123123';

const projectId = 'project_10_02';

describe('10-02 project-settings-change-project-timezone-success (logged in)', () => {
  it(`should be able to change project timezone`, () => {
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
    cy.get('[data-cy=projectSettingsTimezoneSelect]').should(
      'have.text',
      'UTC'
    );
    cy.get('[data-cy=projectSettingsTimezoneSelect]').click();
    cy.get('[data-cy=projectSettingsTimezoneOption]')
      .eq(1)
      .click();
    cy.get('[data-cy=projectSettingsTimezoneApplyChange]').click();
    cy.loading();
    cy.get('[data-cy=projectSettingsTimezoneApplyChange]').should('not.exist');
    cy.get('[data-cy=projectSettingsTimezoneSelect]').should(
      'have.text',
      'America - Adak'
    );
  });
});
