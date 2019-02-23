import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';
import * as enums from '../../../src/app/enums/_index';

const userId = '27-02-user@example.com';
const password = '123123';

const projectId = 'project_27_02';

describe('27-02 model-data-change-columns-order (logged in)', () => {
  it(`should be able to change-columns-order`, () => {
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

    cy.get('[data-cy=mainTableColumnLabel]')
      .eq(0)
      .should('have.text', 'Name');

    cy.get('[data-cy=mainTableColumnMoveRightButton]').click({ force: true });
    cy.loading();

    cy.get('[data-cy=mainTableColumnLabel]')
      .eq(0)
      .should('have.text', 'Value');

    cy.get('[data-cy=mainTableColumnMoveLeftButton]').click({ force: true });
    cy.loading();

    cy.get('[data-cy=mainTableColumnLabel]')
      .eq(0)
      .should('have.text', 'Name');
  });
});
