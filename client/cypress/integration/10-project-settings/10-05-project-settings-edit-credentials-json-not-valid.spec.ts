import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

const userId = '10-05-user@example.com';
const password = '123123';

const projectId = 'project_10_05';

const error =
  api.ServerResponseStatusEnum.SET_PROJECT_CREDENTIALS_ERROR_JSON_NOT_VALID;

describe('10-05 project-settings-edit-credentials-json-not-valid (logged in)', () => {
  it(`should see error`, () => {
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
    cy.basicVisit(`${constants.PATH_PROJECT}/${projectId}/settings`);
    cy.loading();
    cy.get('[data-cy=projectSettingsEditCredentialsButton]').click();
    cy.get('[data-cy=dialogUpdateCredentialsInput]').type('-');
    cy.get('[data-cy=dialogUpdateCredentialsSaveButton]').click();
    cy.loading();
    cy.get('[data-cy=dialogInfoMessage]').should('contain', error);
  });
});
