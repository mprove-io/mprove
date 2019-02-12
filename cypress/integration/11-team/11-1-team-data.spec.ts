import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '11-1-user@example.com';
const password = '123123';

const projectId = 'project_11_1';

describe('11-1 team-data (logged in)', () => {
  it(`should see data`, () => {
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
    cy.basicVisit(`${constants.PATH_PROJECT}/${projectId}/team`);
    cy.loading();
    cy.get('[data-cy=teamTitle]');
    cy.get('[data-cy=teamMemberNameData]').should('contain', 'null null');
    cy.get('[data-cy=teamMemberEmailData]').should('contain', userId);
    cy.get('[data-cy=teamMemberAliasData]').should('contain', '11-1-user');
    cy.get('[data-cy=teamMemberIsAdminCheckbox]').should(
      'have.class',
      'mat-checkbox-checked'
    );
    cy.get('[data-cy=teamMemberIsAdminCheckbox]').should(
      'have.class',
      'mat-checkbox-disabled'
    );
    cy.get('[data-cy=teamMemberIsEditorCheckbox]').should(
      'have.class',
      'mat-checkbox-checked'
    );
    cy.get('[data-cy=teamMemberIsEditorCheckbox]').should(
      'not.have.class',
      'mat-checkbox-disabled'
    );
    cy.get('[data-cy=teamMemberStatusData]').should(
      'contain',
      api.MemberStatusEnum.Active
    );
    cy.get('[data-cy=teamMemberDeleteButton]').should('be.disabled');
  });
});
