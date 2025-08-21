import {
  PATH_PROFILE,
  PATH_REGISTER,
  PATH_USER_DELETED
} from '~common/constants/top';

let testId = '_profile-delete-user__ok';

let email = `${testId}@example.com`;
let password = '123123';

describe('integra', () => {
  it(testId, () => {
    cy.deletePack({ emails: [email] });
    cy.seedPack({
      users: [
        {
          email: email,
          password: password,
          isEmailVerified: true
        }
      ]
    });
    cy.loginUser({ email: email, password: password });
    cy.visit(PATH_PROFILE);
    cy.get('[data-cy=profileDeleteUserButton]').click();
    cy.get('[data-cy=deleteUserDialogDeleteButton]').click();
    cy.loading();
    cy.url().should('include', PATH_USER_DELETED);
    cy.get('[data-cy=userDeletedCreateNewAccountButton]').click();
    cy.url().should('include', PATH_REGISTER);
  });
});
