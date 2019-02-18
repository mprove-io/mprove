import * as constants from '../../../src/app/constants/_index';
import * as api from '../../../src/app/api/_index';
import * as enums from '../../../src/app/enums/_index';

const userId = '13-1-user@example.com';
const password = '123123';

const projectId = 'project_13_1';

describe('13-1 model-filters-string (logged in)', () => {
  it(`should be able to filter string`, () => {
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

    cy.get('[data-cy=modelTreeItemFilterButton]')
      .eq(1)
      .click({ force: true });
    cy.loading();
    cy.get('[data-cy=fractionStringType]').should($elements => {
      expect($elements).to.have.length(1);
    });

    cy.get('[data-cy=fractionStringType]').click();
    cy.get('[data-cy=fractionStringTypeIsEqualTo]').click();
    cy.get('[data-cy=fractionStringValue]').type('FOO');
    cy.get('[data-cy=modelTitle]').click();
    cy.loading();
    cy.get('[data-cy=addModelFilterFraction]').click({ force: true });
    cy.loading();
    cy.get('[data-cy=fractionStringType]').should($elements => {
      expect($elements).to.have.length(2);
    });

    cy.get('[data-cy=fractionStringType]')
      .eq(1)
      .click();
    cy.get('[data-cy=fractionStringTypeContains]').click();
    cy.get('[data-cy=fractionStringValue]')
      .eq(1)
      .type('FOO');
    cy.get('[data-cy=modelTitle]').click();
    cy.loading();
    cy.get('[data-cy=addModelFilterFraction]').click({ force: true });
    cy.loading();
    cy.get('[data-cy=fractionStringType]').should($elements => {
      expect($elements).to.have.length(3);
    });    

    cy.get('[data-cy=fractionStringType]')
      .eq(2)
      .click();
    cy.get('[data-cy=fractionStringTypeStartsWith]').click();
    cy.get('[data-cy=fractionStringValue]')
      .eq(2)
      .type('FOO');
    cy.get('[data-cy=modelTitle]').click();
    cy.loading();
    cy.get('[data-cy=addModelFilterFraction]').click({ force: true });
    cy.loading();
    cy.get('[data-cy=fractionStringType]').should($elements => {
      expect($elements).to.have.length(4);
    });     

    cy.get('[data-cy=fractionStringType]')
      .eq(3)
      .click();
    cy.get('[data-cy=fractionStringTypeEndsWith]').click();
    cy.get('[data-cy=fractionStringValue]')
      .eq(3)
      .type('FOO');
    cy.get('[data-cy=modelTitle]').click();
    cy.loading();
    cy.get('[data-cy=addModelFilterFraction]').click({ force: true });
    cy.loading();
    cy.get('[data-cy=fractionStringType]').should($elements => {
      expect($elements).to.have.length(5);
    });     
    

    cy.get('[data-cy=fractionStringType]')
      .eq(4)
      .click();
    cy.get('[data-cy=fractionStringTypeIsNull]').click();
    cy.get('[data-cy=modelTitle]').click();
    cy.loading();
    cy.get('[data-cy=addModelFilterFraction]').click({ force: true });
    cy.loading();
    cy.get('[data-cy=fractionStringType]').should($elements => {
      expect($elements).to.have.length(6);
    });     

    cy.get('[data-cy=addModelFilterFraction]').click({ force: true });
    cy.loading();
    cy.get('[data-cy=fractionStringType]')
      .eq(5)
      .click();
    cy.get('[data-cy=fractionStringTypeIsBlank]').click();
    cy.get('[data-cy=modelTitle]').click();
    cy.loading();
    cy.get('[data-cy=addModelFilterFraction]').click({ force: true });
    cy.loading();
    cy.get('[data-cy=fractionStringType]').should($elements => {
      expect($elements).to.have.length(7);
    });     

    cy.get('[data-cy=fractionStringType]')
      .eq(6)
      .click();
    cy.get('[data-cy=fractionStringTypeIsNotEqualTo]').click();
    cy.get('[data-cy=fractionStringValue]')
      .eq(4)
      .type('FOO');
    cy.get('[data-cy=modelTitle]').click();
    cy.loading();
    cy.get('[data-cy=addModelFilterFraction]').click({ force: true });
    cy.loading();
    cy.get('[data-cy=fractionStringType]').should($elements => {
      expect($elements).to.have.length(8);
    });     

    cy.get('[data-cy=fractionStringType]')
      .eq(6)
      .click();
    cy.get('[data-cy=fractionStringTypeDoesNotContain]').click();
    cy.get('[data-cy=fractionStringValue]')
      .eq(4)
      .type('FOO');
    cy.get('[data-cy=modelTitle]').click();
    cy.loading();
    cy.get('[data-cy=addModelFilterFraction]').click({ force: true });
    cy.loading();
    cy.get('[data-cy=fractionStringType]').should($elements => {
      expect($elements).to.have.length(9);
    });    

    cy.get('[data-cy=fractionStringType]')
      .eq(6)
      .click();
    cy.get('[data-cy=fractionStringTypeDoesNotStartWith]').click();
    cy.get('[data-cy=fractionStringValue]')
      .eq(4)
      .type('FOO');
    cy.get('[data-cy=modelTitle]').click();
    cy.loading();
    cy.get('[data-cy=addModelFilterFraction]').click({ force: true });
    cy.loading();
    cy.get('[data-cy=fractionStringType]').should($elements => {
      expect($elements).to.have.length(10);
    });    

    cy.get('[data-cy=fractionStringType]')
      .eq(6)
      .click();
    cy.get('[data-cy=fractionStringTypeDoesNotEndWith]').click();
    cy.get('[data-cy=fractionStringValue]')
      .eq(4)
      .type('FOO');
    cy.get('[data-cy=modelTitle]').click();
    cy.loading();
    cy.get('[data-cy=addModelFilterFraction]').click({ force: true });
    cy.loading();
    cy.get('[data-cy=fractionStringType]').should($elements => {
      expect($elements).to.have.length(11);
    });    

    cy.get('[data-cy=fractionStringType]')
      .eq(6)
      .click();
    cy.get('[data-cy=fractionStringTypeIsNotNull]').click();
    cy.get('[data-cy=modelTitle]').click();
    cy.loading();
    cy.get('[data-cy=addModelFilterFraction]').click({ force: true });
    cy.loading();
    cy.get('[data-cy=fractionStringType]').should($elements => {
      expect($elements).to.have.length(12);
    });    

    cy.get('[data-cy=fractionStringType]')
      .eq(6)
      .click();
    cy.get('[data-cy=fractionStringTypeIsNotBlank]').click();
    cy.get('[data-cy=modelTitle]').click();
    cy.loading();
    cy.get('[data-cy=addModelFilterFraction]').click({ force: true });
    cy.loading();
    cy.get('[data-cy=fractionStringType]').should($elements => {
      expect($elements).to.have.length(13);
    });
  });
});
