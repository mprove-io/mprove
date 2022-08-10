import { common } from '~integra/barrels/common';

let testId = '_edit-org-owner__ok';

let email = `${testId}@example.com`;
let password = '123123';

let secondUserEmail = `${testId}2@example.com`;
let secondUserPassword = '123123';

let orgId = 't' + testId;
let orgName = testId;

describe('integra', () => {
  it(testId, () => {
    cy.deletePack({
      emails: [email, secondUserEmail],
      orgIds: [orgId]
    });
    cy.seedPack({
      users: [
        {
          email: email,
          password: password,
          isEmailVerified: common.BoolEnum.TRUE
        },
        {
          email: secondUserEmail,
          password: secondUserPassword,
          isEmailVerified: common.BoolEnum.TRUE
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
    cy.visit(`${common.PATH_ORG}/${orgId}/${common.PATH_ACCOUNT}`);
    cy.get('[data-cy=orgAccountEditOwnerButton]').click();
    cy.get('[data-cy=editOrgOwnerDialogEmailInput]')
      .clear({ force: true })
      .type(secondUserEmail);
    cy.get('[data-cy=editOrgOwnerDialogSaveButton]').click();
    cy.loading();
    cy.get('[data-cy=orgOwnerChangedTitle]');
  });
});
