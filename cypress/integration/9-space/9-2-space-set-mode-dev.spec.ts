import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '9-2-user@example.com';
const password = '123123';

const projectId = 'project-9-2';

describe('9-2 space-set-mode-dev (logged in)', () => {
  it(`should be able to set mode Dev`, () => {
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
    cy.basicVisit(`${constants.PATH_PROJECT}/${projectId}/mode/prod/blockml`);
    cy.loading();
    cy.get('[data-cy=blockmlTitleMode]').should('have.text', 'Prod');
    cy.get('[data-cy=spaceModeToggle]').eq(1).click();
    cy.get('[data-cy=blockmlTitleMode]').should('have.text', 'Dev');
  });
});
