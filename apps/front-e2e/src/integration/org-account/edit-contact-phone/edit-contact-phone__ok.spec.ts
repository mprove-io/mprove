import { common } from '~front-e2e/barrels/common';

let testId = '_edit-contact-phone__ok';

let email = `${testId}@example.com`;
let password = '123123';

let orgId = 't' + testId;
let orgName = testId;
let newPhoneNumber = '123';

describe('front-e2e', () => {
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
    cy.get('[data-cy=orgAccountEditContactPhoneButton]').click();
    cy.get('[data-cy=editPhoneNumberDialogContactPhoneInput]').type(
      newPhoneNumber
    );
    cy.get('[data-cy=editPhoneNumberDialogSaveButton]').click();
    cy.loading();
    cy.get('[data-cy=orgAccountContactPhone]').should(
      'contain',
      newPhoneNumber
    );
  });
});
