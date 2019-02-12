import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '11-3-user-a@example.com';
const secondUserId = '11-3-user-b@example.com';
const password = '123123';

const projectId = 'project_11_3';

describe('11-3 team-edit-member (logged in)', () => {
  it(`should be able to edit member`, () => {
    cy.deletePack({
      user_ids: [userId, secondUserId],
      project_ids: [projectId]
    });
    cy.seedPack({
      users: [
        {
          user_id: userId,
          password: password,
          email_verified: true
        },
        {
          user_id: secondUserId,
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
        },
        {
          project_id: projectId,
          member_id: secondUserId,
          is_admin: false,
          is_editor: false
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
    cy.basicVisit(`${constants.PATH_PROJECT}/${projectId}/team`);
    cy.loading();

    // is admin
    cy.get('[data-cy=teamMemberIsAdminCheckbox]')
      .eq(1)
      .should('not.have.class', 'mat-checkbox-checked');
    cy.get('[data-cy=teamMemberIsAdminCheckbox]')
      .eq(1)
      .click();
    cy.loading();
    cy.get('[data-cy=teamMemberIsAdminCheckbox]')
      .eq(1)
      .should('have.class', 'mat-checkbox-checked');
    cy.get('[data-cy=teamMemberIsAdminCheckbox]')
      .eq(1)
      .click();
    cy.loading();
    cy.get('[data-cy=teamMemberIsAdminCheckbox]')
      .eq(1)
      .should('not.have.class', 'mat-checkbox-checked');

    // is editor
    cy.get('[data-cy=teamMemberIsEditorCheckbox]')
      .eq(1)
      .should('not.have.class', 'mat-checkbox-checked');
    cy.get('[data-cy=teamMemberIsEditorCheckbox]')
      .eq(1)
      .click();
    cy.loading();
    cy.get('[data-cy=teamMemberIsEditorCheckbox]')
      .eq(1)
      .should('have.class', 'mat-checkbox-checked');
    cy.get('[data-cy=teamMemberIsEditorCheckbox]')
      .eq(1)
      .click();
    cy.loading();
    cy.get('[data-cy=teamMemberIsEditorCheckbox]')
      .eq(1)
      .should('not.have.class', 'mat-checkbox-checked');
  });
});
