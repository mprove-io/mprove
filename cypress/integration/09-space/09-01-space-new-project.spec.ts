import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '09-01-user@example.com';
const password = '123123';

const projectId = 'project_09_01';

describe('09-01 space-new-project (logged in)', () => {
  it(`should be able create new project`, () => {
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
      ]
    });
    cy.loginUser({ user_id: userId, password: password });
    cy.basicVisit(constants.PATH_PROFILE);
    cy.loading();
    cy.get('[data-cy=projectSelectMenuButton]')
      .eq(1)
      .click();
    cy.get('[data-cy=projectSelectMenuNewProjectButton]').click();
    cy.get('[data-cy=dialogNewProjectNameInput]').type(projectId);
    cy.get('[data-cy=dialogNewProjectAddButton]').click();
    cy.loading();
    cy.url().should('include', `${constants.PATH_PROJECT}/${projectId}/team`);
  });
});
