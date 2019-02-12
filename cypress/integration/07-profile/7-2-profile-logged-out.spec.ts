import * as constants from '../../../src/app/constants/_index';

describe('7-2 profile-logged-out', () => {
  it(`should redirect to "${constants.PATH_LOGIN}"`, () => {
    cy.basicVisit(constants.PATH_PROFILE);
    cy.get('[data-cy=loginTitle]');
  });
});
