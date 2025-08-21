import { PATH_PROFILE } from '~common/constants/top';
import { capitalizeFirstLetter } from '~common/functions/capitalize-first-letter';

let testId = '_profile-edit-name__ok';

let email = `${testId}@example.com`;
let password = '123123';

let firstName = 'John';
let lastName = 'Smith';
let fullName =
  capitalizeFirstLetter(firstName) + ' ' + capitalizeFirstLetter(lastName);

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
    cy.get('[data-cy=profileEditNameButton]').click();
    cy.get('[data-cy=editNameDialogTitle]');
    cy.get('[data-cy=editNameDialogFirstNameInput]').type(firstName);
    cy.get('[data-cy=editNameDialogLastNameInput]').type(lastName);
    cy.get('[data-cy=editNameDialogSaveButton]').click();
    cy.loading();
    cy.get('[data-cy=profileFullName]').should('contain', fullName);
  });
});
