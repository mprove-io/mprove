import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '10-1-user@example.com';
const password = '123123';

const projectId = 'project_10_1';

describe('10-1 project-settings-change-query-size-limit-success (logged in)', () => {
  it(`should be able change query size limit`, () => {
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
    cy.get('[data-cy=projectSettingsQuerySizeLimitInput]').should('have.value', '1');
    cy.get('[data-cy=projectSettingsQuerySizeLimitInput]').clear();
    cy.get('[data-cy=projectSettingsQuerySizeLimitInput]').type('5');
    cy.get('[data-cy=projectSettingsQuerySizeLimitApplyChange]').click();
    cy.get('[data-cy=projectSettingsQuerySizeLimitApplyChange]').should('not.exist');
    cy.loading();
    cy.get('[data-cy=projectSettingsQuerySizeLimitInput]').should('have.value', '5');
  });
});
