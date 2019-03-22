import * as constants from '../../../src/app/constants/_index';

const userId = '10-03-user@example.com';
const password = '123123';

const projectId = 'project_10_03';

describe('10-03 project-settings-change-week-start-day-success (logged in)', () => {
  it(`should be able to change project week start day`, () => {
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
    cy.get('[data-cy=projectSettingsWeekStartSelect]').should(
      'have.text',
      'Sunday'
    );
    cy.get('[data-cy=projectSettingsWeekStartSelect]').click();
    cy.get('[data-cy=projectSettingsWeekStartOption]')
      .eq(1)
      .click();
    cy.get('[data-cy=projectSettingsWeekStartApplyChange]').click();
    cy.loading();
    cy.get('[data-cy=projectSettingsWeekStartApplyChange]').should('not.exist');
    cy.get('[data-cy=projectSettingsWeekStartSelect]').should(
      'have.text',
      'Monday'
    );
  });
});
