import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '11-2-user@example.com';
const invitedUserId = '11-2-invited-user@example.com';
const password = '123123';

const projectId = 'project_11_2';

describe('11-2 team-invite-member (logged in)', () => {
  it(`should be able to invite member`, () => {
    cy.deletePack({
      user_ids: [userId, invitedUserId],
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
    cy.get('[data-cy=teamInviteMemberButton]').click();
    cy.get('[data-cy=dialogTeamInviteMemberEmailInput]').type(invitedUserId);
    cy.get('[data-cy=dialogTeamInviteMemberInviteButton]').click();
    cy.loading();
    cy.get('[data-cy=teamMemberNameData]')
      .eq(0)
      .should('contain', 'null null');
    cy.get('[data-cy=teamMemberEmailData]')
      .eq(0)
      .should('contain', invitedUserId);
    cy.get('[data-cy=teamMemberAliasData]')
      .eq(0)
      .should('contain', '11-2-invited-user');
    cy.get('[data-cy=teamMemberIsAdminCheckbox]')
      .eq(0)
      .should('not.have.class', 'mat-checkbox-checked');
    cy.get('[data-cy=teamMemberIsAdminCheckbox]')
      .eq(0)
      .should('not.have.class', 'mat-checkbox-disabled');
    cy.get('[data-cy=teamMemberIsEditorCheckbox]')
      .eq(0)
      .should('not.have.class', 'mat-checkbox-checked');
    cy.get('[data-cy=teamMemberIsEditorCheckbox]')
      .eq(0)
      .should('not.have.class', 'mat-checkbox-disabled');
    cy.get('[data-cy=teamMemberStatusData]')
      .eq(0)
      .should('contain', api.MemberStatusEnum.Pending);
    cy.get('[data-cy=teamMemberDeleteButton]').should('be.enabled');
  });
});
