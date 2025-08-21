import { PATH_ACCOUNT, PATH_ORG } from '~common/constants/top';

let testId = '_edit-org-name__ok';

let email = `${testId}@example.com`;
let password = '123123';

let orgId = 't' + testId;
let orgName = testId;
let newOrgName = testId + '2';

describe('integra', () => {
  it(testId, () => {
    cy.deletePack({
      emails: [email],
      orgIds: [orgId]
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
    cy.get('[data-cy=orgAccountEditNameButton]').click();
    cy.get('[data-cy=editOrgNameDialogOrgNameInput]')
      .clear({ force: true })
      .type(newOrgName);
    cy.get('[data-cy=editOrgNameDialogSaveButton]').click();
    cy.loading();
    cy.get('[data-cy=orgAccountName]').should('contain', newOrgName);
  });
});
