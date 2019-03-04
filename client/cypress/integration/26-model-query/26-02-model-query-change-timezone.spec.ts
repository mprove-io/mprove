import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';
import * as enums from '../../../src/app/enums/_index';

const userId = '26-02-user@example.com';
const password = '123123';

const projectId = 'project_26_02';

describe('26-02 model-query-change-timezone (logged in)', () => {
  it(`should be able to change-timezone`, () => {
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

    cy.get('[data-cy=queryTabData]').click();
    cy.get('[data-cy=modelQueryRunButton]').click();
    cy.loading();

    cy.get('[data-cy=dataTableRow]', { timeout: 10000 })
      .eq(0)
      .should('exist');

    cy.get('[data-cy=modelMconfigTimezoneSelect').click();
    cy.get('[data-cy=modelMconfigTimezoneOption')
      .eq(1)
      .click();
    cy.loading();

    cy.contains('Run query to get data').should('exist');
  });
});
