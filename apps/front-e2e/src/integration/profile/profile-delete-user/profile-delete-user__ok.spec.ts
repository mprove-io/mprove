import { common } from '~front-e2e/barrels/common';

let testId = '_profile-delete-user__ok';

let email = `${testId}@example.com`;
let password = '123123';

describe('front-e2e', () => {
  it(testId, () => {
    cy.deletePack({ emails: [email] });
    cy.seedPack({
      users: [
        {
          email: email,
          password: password,
          isEmailVerified: common.BoolEnum.TRUE
        }
      ]
    });
    cy.loginUser({ email: email, password: password });
    cy.visit(common.PATH_PROFILE);
    cy.get('[data-cy=profileDeleteUserButton]').click();
    cy.get('[data-cy=deleteUserDialogDeleteButton]').click();
    cy.loading();
    cy.url().should('include', common.PATH_USER_DELETED);
    cy.get('[data-cy=userDeletedCreateNewAccountButton]').click();
    cy.loading();
    cy.url().should('include', common.PATH_REGISTER);
  });
});
