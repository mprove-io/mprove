import { PATH_ACCOUNT, PATH_ORG } from '~common/constants/top';

let testId = '_navbar-create-project__ok';

let email = `${testId}@example.com`;
let password = '123123';

let orgId = 't' + testId;
let orgName = testId;

let projectName = testId;

describe('integra', () => {
  it(testId, () => {
    cy.deletePack({
      emails: [email],
      orgNames: [orgName],
      orgIds: [orgId],
      projectNames: [projectName]
    });
    cy.seedPack({
      users: [
        {
          email: email,
          password: password,
          isEmailVerified: true
        }
      ],
      orgs: [
        {
          orgId: orgId,
          ownerEmail: email,
          name: orgName
        }
      ]
    });
    cy.loginUser({ email: email, password: password });
    cy.visit(`${PATH_ORG}/${orgId}/${PATH_ACCOUNT}`);
    cy.get('[data-cy=projectSelect]').click();
    cy.get('[data-cy=projectSelectCreateProjectButton]').click();
    cy.get('[data-cy=createProjectDialogManagedCheckbox]').click();
    cy.get('[data-cy=createProjectDialogProjectNameInput]').type(projectName);
    cy.get('[data-cy=createProjectDialogCreateButton]').click();
    cy.loading();
    cy.get('[data-cy=filesTitle]').should('exist');
  });
});
