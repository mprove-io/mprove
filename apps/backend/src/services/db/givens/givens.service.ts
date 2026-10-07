import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { GivenTab } from '#backend/drizzle/postgres/schema/_tabs';
import { givensTable } from '#backend/drizzle/postgres/schema/givens';
import { RolesService } from '#backend/services/db/roles/roles.service';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { getGivenValueValidationError } from '#common/functions/get-given-value-validation-error/get-given-value-validation-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Given } from '#common/types/backend/parts/given/given';
import type { GivenType } from '#common/types/backend/parts/given/given-type';
import type { MemberGiven } from '#common/types/backend/parts/members/member-given';
import type { MemberGivenValue } from '#common/types/backend/parts/members/member-given-value';

@Injectable()
export class GivensService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    private rolesService: RolesService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  makeGiven(item: {
    projectId: string;
    givenId: string;
    type: GivenType;
    isMultiple: boolean;
    values: string[];
  }): GivenTab {
    let { projectId, givenId, type, isMultiple, values } = item;

    let given: GivenTab = {
      givenFullId: this.hashService.makeGivenFullId({
        projectId: projectId,
        givenId: givenId
      }),
      projectId: projectId,
      givenId: givenId,
      type: type,
      isMultiple: isMultiple,
      values: values,
      keyTag: undefined,
      serverTs: undefined
    };

    return given;
  }

  tabToApi(item: { given: GivenTab }): Given {
    let { given } = item;

    let apiGiven: Given = {
      projectId: given.projectId,
      givenId: given.givenId,
      type: given.type,
      isMultiple: given.isMultiple === true,
      values: given.values
    };

    return apiGiven;
  }

  validateGivenValues(item: {
    type: GivenType;
    isMultiple: boolean;
    values: string[];
  }) {
    let { type, isMultiple, values } = item;

    let error = getGivenValueValidationError({
      type: type,
      isMultiple: isMultiple,
      values: values
    });

    if (isDefined(error)) {
      throw new ServerError({
        message: 'BACKEND_WRONG_GIVEN_VALUE',
        displayData: {
          error: error
        }
      });
    }
  }

  async checkGivenDoesNotExist(item: { projectId: string; givenId: string }) {
    let { projectId, givenId } = item;

    let given = await this.db.drizzle.query.givensTable.findFirst({
      where: and(
        eq(givensTable.projectId, projectId),
        eq(givensTable.givenId, givenId)
      )
    });

    if (isDefined(given)) {
      throw new ServerError({
        message: 'BACKEND_GIVEN_ALREADY_EXISTS'
      });
    }
  }

  async getGivenCheckExists(item: { projectId: string; givenId: string }) {
    let { projectId, givenId } = item;

    let given = await this.db.drizzle.query.givensTable
      .findFirst({
        where: and(
          eq(givensTable.projectId, projectId),
          eq(givensTable.givenId, givenId)
        )
      })
      .then(x => this.tabService.givenEntToTab(x));

    if (isUndefined(given)) {
      throw new ServerError({
        message: 'BACKEND_GIVEN_DOES_NOT_EXIST'
      });
    }

    return given;
  }

  async getApiGivens(item: { projectId: string }) {
    let { projectId } = item;

    let givens = await this.db.drizzle.query.givensTable
      .findMany({
        where: eq(givensTable.projectId, projectId)
      })
      .then(xs => xs.map(x => this.tabService.givenEntToTab(x)));

    let apiGivens = givens
      .map(given => this.tabToApi({ given: given }))
      .sort((a, b) =>
        a.givenId > b.givenId ? 1 : b.givenId > a.givenId ? -1 : 0
      );

    return apiGivens;
  }

  async getMemberGivensForSelection(item: {
    projectId: string;
    roles: string[];
  }) {
    let { projectId, roles } = item;

    let apiGivens = await this.getApiGivens({
      projectId: projectId
    });

    let apiRoles = await this.rolesService.getApiRoles({
      projectId: projectId
    });

    let memberRoles = apiRoles.filter(role => roles.indexOf(role.roleId) > -1);

    let valueOriginsByGivenId: Record<
      string,
      Record<string, { isProjectDefault: boolean; roleIds: string[] }>
    > = {};
    let typeByGivenId: Record<string, GivenType> = {};
    let isMultipleByGivenId: Record<string, boolean> = {};

    apiGivens.forEach(given => {
      valueOriginsByGivenId[given.givenId] = {};
      typeByGivenId[given.givenId] = given.type;
      isMultipleByGivenId[given.givenId] = given.isMultiple;

      given.values.forEach(value => {
        valueOriginsByGivenId[given.givenId][value] = {
          isProjectDefault: true,
          roleIds: []
        };
      });
    });

    memberRoles.forEach(role => {
      role.gvs.forEach(gv => {
        let isGivenMissing = !valueOriginsByGivenId[gv.givenId];
        if (isGivenMissing) {
          valueOriginsByGivenId[gv.givenId] = {};
        }

        gv.values.forEach(value => {
          let isValueMissing = !valueOriginsByGivenId[gv.givenId][value];
          if (isValueMissing) {
            valueOriginsByGivenId[gv.givenId][value] = {
              isProjectDefault: false,
              roleIds: []
            };
          }

          valueOriginsByGivenId[gv.givenId][value].roleIds.push(role.roleId);
        });
      });
    });

    return Object.keys(valueOriginsByGivenId)
      .sort((a, b) => (a > b ? 1 : b > a ? -1 : 0))
      .map(givenId => {
        let valueOrigins = valueOriginsByGivenId[givenId];

        let memberGivenValues: MemberGivenValue[] = Object.keys(valueOrigins)
          .sort((a, b) => (a > b ? 1 : b > a ? -1 : 0))
          .map(value => ({
            value: value,
            isProjectDefault: valueOrigins[value].isProjectDefault,
            roleIds: valueOrigins[value].roleIds
          }));

        let memberGiven: MemberGiven = {
          givenId: givenId,
          type: typeByGivenId[givenId],
          isMultiple: isMultipleByGivenId[givenId] === true,
          memberGivenValues: memberGivenValues
        };

        return memberGiven;
      });
  }
}
