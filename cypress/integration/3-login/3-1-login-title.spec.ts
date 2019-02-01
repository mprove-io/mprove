import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';

describe('3-1 login-title (logged out)', () => {
  it(`should display title`, () => {
    cy.basicVisit(constants.PATH_LOGIN);
    cy.get(`[data-cy=loginTitle]`);
    cy.noLoading();
  });
});
