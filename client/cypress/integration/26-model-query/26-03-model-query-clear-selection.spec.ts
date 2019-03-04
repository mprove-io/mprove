import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';
import * as enums from '../../../src/app/enums/_index';

const userId = '26-03-user@example.com';
const password = '123123';

const projectId = 'project_26_03';

describe('26-03 model-query-clear-selection (logged in)', () => {
  it(`should be able to clear-selection`, () => {
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
    cy.basicVisit(
      `${constants.PATH_PROJECT}/${projectId}/${constants.PATH_MODE}/${
        enums.LayoutModeEnum.Prod
      }/dashboard/d1`
    );
    cy.loading();

    cy.get('[data-cy=reportTitleText]')
      .eq(0)
      .click();
    cy.loading();

    cy.get('[data-cy=modelQueryMenu]').click();
    cy.get('[data-cy=modelQueryMenuClearSelectionButton]').click();
    cy.contains('Select some fields').should('exist');
  });
});
