import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';
import * as enums from '../../../src/app/enums/_index';

const userId = '20-07-user@example.com';
const password = '123123';

const projectId = 'project_20_07';

describe('20-07 model-filters-ts-type-is-in-last (logged in)', () => {
  it(`should be able to filter ts-type-is-in-last`, () => {
    cy.deletePack({
      user_ids: [userId],
      project_ids: [projectId]
    });
    cy.seedPack({
      users: [
        {
          user_id: userId,
          password: password,
          email_verified: true
        }
      ],
      members: [
        {
          project_id: projectId,
          member_id: userId,
          is_admin: true,
          is_editor: true
        }
      ],
      projects: [
        {
          project_id: projectId,
          has_credentials: true
        }
      ]
    });
    cy.loginUser({ user_id: userId, password: password });
    cy.basicVisit(
      `${constants.PATH_PROJECT}/${projectId}/${constants.PATH_MODE}/${
        enums.LayoutModeEnum.Prod
      }/model/m1`
    );
    cy.loading();

    cy.get('[data-cy=modelTreeItem]')
      .eq(5)
      .click({ force: true });

    cy.get('[data-cy=modelTreeItemFilterButton]')
      .eq(0)
      .click({ force: true });
    cy.loading();

    cy.get('[data-cy=fractionTsType]').click();
    cy.get('[data-cy=fractionTsTypeIsInLast]').click();
    cy.loading();

    cy.get('[data-cy=fractionTsLastValue]')
      .clear()
      .type('5');
    cy.get('[data-cy=modelTitle]').click();
    cy.loading();

    cy.get('[data-cy=fractionTsLastUnit]').click({ force: true });
    cy.get('[data-cy=fractionTsLastUnitDays]').click();
    cy.loading();

    cy.get('[data-cy=fractionTsLastCompleteOption]').click();
    cy.get('[data-cy=fractionTsLastCompleteOptionCompletePlusCurrent]').click();
    cy.loading();

    cy.get('[data-cy=addModelFilterFraction]').click({ force: true });
    cy.loading();

    cy.get('[data-cy=fractionTsType]').should($elements => {
      expect($elements).to.have.length(2);
    });
  });
});
