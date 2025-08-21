import { PATH_REGISTER, PATH_VERIFY_EMAIL } from '~common/constants/top';

let testId = '_register__ok';

let email = `${testId}@example.com`;
let password = '123123';

describe('integra', () => {
  it(testId, () => {
    cy.deletePack({ emails: [email] });
    cy.visit(PATH_REGISTER);
    cy.get(`[data-cy=registerTitle]`);
    cy.get('[data-cy=registerEmailInput]').type(email);
    cy.get('[data-cy=registerPasswordInput]').type(password);
    cy.get('[data-cy=registerSignUpButton]').click();
    cy.loading();
    cy.url().should('include', PATH_VERIFY_EMAIL);
  });
});
