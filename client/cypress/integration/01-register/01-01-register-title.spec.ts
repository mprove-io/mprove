import * as constants from '../../../src/app/constants/_index';

describe('01-01 register-title (logged out)', () => {
  it(`should display title`, () => {
    cy.basicVisit(constants.PATH_REGISTER);
    cy.get(`[data-cy=registerTitle]`);
  });
});
