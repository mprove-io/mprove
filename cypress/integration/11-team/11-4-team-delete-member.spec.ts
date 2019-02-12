import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '11-4-user-a@example.com';
const secondUserId = '11-4-user-b@example.com';
const password = '123123';

const projectId = 'project_11_4';

describe('11-4 team-delete-member (logged in)', () => {
  it(`should be able to delete member`, () => {
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
    cy.get('[data-cy=teamMemberEmailData]').should($elements => {
      expect($elements).to.have.length(2);
    });
    cy.get('[data-cy=teamMemberDeleteButton]').should($elements => {
      expect($elements).to.have.length(2);
    });
    cy.get('[data-cy=teamMemberDeleteButton]')
      .eq(1)
      .click({ force: true });
    cy.loading();
    cy.get('[data-cy=teamMemberEmailData]').should($elements => {
      expect($elements).to.have.length(1);
    });
  });
});
