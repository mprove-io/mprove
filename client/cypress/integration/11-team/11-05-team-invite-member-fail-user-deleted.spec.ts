import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '11-05-user-a@example.com';
const invitedUserId = '11-05-user-b@example.com';
const password = '123123';

const projectId = 'project_11_05';
const error = api.ServerResponseStatusEnum.INVITE_MEMBER_ERROR_USER_DELETED;

describe('11-05 team-invite-member (logged in)', () => {
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
        },
        {
          user_id: invitedUserId,
          password: password,
          email_verified: true,
          deleted: true
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
    cy.get('[data-cy=dialogInfoMessage]').should('contain', error);
  });
});
