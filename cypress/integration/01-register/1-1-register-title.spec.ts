import * as constants from '../../../src/app/constants/_index';

describe('1-1 register-title (logged out)', () => {
  it(`should display title`, () => {
    cy.basicVisit(constants.PATH_REGISTER);
    cy.get(`[data-cy=registerTitle]`);
  });
});
