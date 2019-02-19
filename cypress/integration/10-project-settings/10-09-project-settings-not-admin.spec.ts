import * as constants from '../../../src/app/constants/_index';

const userId = '10-09-user@example.com';
const password = '123123';

const projectId = 'project_10_09';

describe('10-09 project-settings-not-admin (logged in)', () => {
  it(`should not be able to edit settings`, () => {
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
          is_admin: false,
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
    cy.get('[data-cy=projectSettingsEditCredentialsButton]').should(
      'be.disabled'
    );
    cy.get('[data-cy=projectSettingsQuerySizeLimitInput]').should(
      'be.disabled'
    );
    cy.get('[data-cy=projectSettingsTimezoneSelect]').should(
      'have.class',
      'mat-select-disabled'
    );
    cy.get('[data-cy=projectSettingsWeekStartSelect]').should(
      'have.class',
      'mat-select-disabled'
    );
    cy.get('[data-cy=projectSettingsDeleteButton]').should('be.disabled');
  });
});
