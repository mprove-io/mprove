import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

describe('5-1 update-password-title (logged out)', () => {
  it(`should display title`, () => {
    cy.basicVisit(constants.PATH_UPDATE_PASSWORD);
    cy.get(`[data-cy=updatePasswordTitle]`);
  });
});
