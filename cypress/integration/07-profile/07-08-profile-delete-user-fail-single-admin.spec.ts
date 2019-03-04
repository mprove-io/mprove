import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '07-08-user@example.com';
const password = '123123';

const projectId = 'project_07_08';

const error =
  api.ServerResponseStatusEnum
    .DELETE_USER_ERROR_USER_IS_THE_SINGLE_ADMIN_IN_PROJECT;

describe('07-08 profile-delete-user-fail-single-admin (logged in)', () => {
  it(`should see error`, () => {
    cy.deletePack({ user_ids: [userId], project_ids: [projectId] });
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
    cy.basicVisit(constants.PATH_PROFILE);
    cy.loading();
    cy.get('[data-cy=profileDeleteUserButton]').click();
    cy.get('[data-cy=dialogDeleteUserYesButton]').click();
    cy.loading();
    cy.get('[data-cy=dialogInfoMessage]').should('contain', error);
  });
});
