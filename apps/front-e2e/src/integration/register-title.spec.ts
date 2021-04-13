import { common } from '~front-e2e/barrels/common';

describe('front', () => {
  it('should display title', () => {
    cy.visit(common.PATH_REGISTER);
    cy.get(`[cy=registerTitle]`);
  });
});
