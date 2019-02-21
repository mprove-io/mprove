import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';
import * as enums from '../../../src/app/enums/_index';

const userId = '20-06-user@example.com';
const password = '123123';

const projectId = 'project_20_06';

describe('20-06 model-filters-ts-type-is-after-relative (logged in)', () => {
  it(`should be able to filter ts-type-is-after-relative`, () => {
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
    cy.get('[data-cy=fractionTsTypeIsAfterRelative]').click();
    cy.loading();

    cy.get('[data-cy=fractionTsRelativeValue]')
      .clear()
      .type('5');
    cy.get('[data-cy=modelTitle]').click();
    cy.loading();

    cy.get('[data-cy=fractionTsRelativeUnit]').click();
    cy.get('[data-cy=fractionTsRelativeUnitDays]').click();
    cy.loading();

    cy.get('[data-cy=fractionTsRelativeCompleteOption]').click();
    cy.get('[data-cy=fractionTsRelativeCompleteOptionComplete]').click();
    cy.loading();

    cy.get('[data-cy=fractionTsRelativeWhenOption]').click();
    cy.get('[data-cy=fractionTsRelativeWhenOptionInFuture]').click();
    cy.loading();

    cy.get('[data-cy=fractionTsForOption]').click();
    cy.get('[data-cy=fractionTsForOptionFor]').click();
    cy.loading();

    cy.get('[data-cy=fractionTsForValue]')
      .clear()
      .type('2');
    cy.get('[data-cy=modelTitle]').click();
    cy.loading();

    cy.get('[data-cy=fractionTsForUnit]').click();
    cy.get('[data-cy=fractionTsForUnitMonths]').click();
    cy.loading();

    cy.get('[data-cy=addModelFilterFraction]').click({ force: true });
    cy.loading();

    cy.get('[data-cy=fractionTsType]').should($elements => {
      expect($elements).to.have.length(2);
    });
  });
});
