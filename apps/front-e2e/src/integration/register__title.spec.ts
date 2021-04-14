import { common } from '~front-e2e/barrels/common';

let testId = '_register__title';

describe('front-e2e', () => {
  it(testId, () => {
    cy.visit(common.PATH_REGISTER);
    cy.get(`[data-cy=registerTitle]`);
  });
});
