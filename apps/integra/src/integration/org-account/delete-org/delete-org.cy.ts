import { PATH_ACCOUNT, PATH_ORG } from '~common/constants/top';

let testId = '_delete-org__ok';

let email = `${testId}@example.com`;
let password = '123123';

let orgId = 't' + testId;
let orgName = testId;

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
    cy.get('[data-cy=orgAccountDeleteOrgButton]').click();
    cy.get('[data-cy=deleteOrgDialogDeleteButton]').click();
    cy.loading();
    cy.get('[data-cy=orgDeletedTitle]');
  });
});
