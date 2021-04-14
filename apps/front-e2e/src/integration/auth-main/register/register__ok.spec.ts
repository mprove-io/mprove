import { common } from '~front-e2e/barrels/common';

let testId = '_register__ok';
let email = `${testId}@example.com`;
let password = '123123';

describe('front-e2e', () => {
  it(testId, () => {
    cy.deletePack({ emails: [email] });
    cy.visit(common.PATH_REGISTER);
    cy.get(`[data-cy=registerTitle]`);
    cy.get('[data-cy=registerEmailInput]').type(email);
    cy.get('[data-cy=registerPasswordInput]').type(password);
    cy.get('[data-cy=registerSignUpButton]').click();
    cy.loading();
    cy.url().should('include', common.PATH_VERIFY_EMAIL);
  });
});
