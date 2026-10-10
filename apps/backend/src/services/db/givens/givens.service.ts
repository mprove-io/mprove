import { Inject, Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { GivenTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  type GivenEnt,
  givensTable
} from '#backend/drizzle/postgres/schema/givens';
import { RolesService } from '#backend/services/db/roles/roles.service';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { getGivenValueValidationError } from '#common/functions/get-given-value-validation-error/get-given-value-validation-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { CheckGivenDoesNotExistResultError } from '#common/types/backend/function-errors/check-given-does-not-exist-result-error';
import type { GetApiGivensResultError } from '#common/types/backend/function-errors/get-api-givens-result-error';
import type { GetApiRolesResultError } from '#common/types/backend/function-errors/get-api-roles-result-error';
import type { GetGivenCheckExistsResultError } from '#common/types/backend/function-errors/get-given-check-exists-result-error';
import type { GetMemberGivensForSelectionResultError } from '#common/types/backend/function-errors/get-member-givens-for-selection-result-error';
import type { GivenEntToTabResultError } from '#common/types/backend/function-errors/given-ent-to-tab-result-error';
import type { ValidateGivenValuesResultError } from '#common/types/backend/function-errors/validate-given-values-result-error';
import type { Given } from '#common/types/backend/parts/given/given';
import type { GivenType } from '#common/types/backend/parts/given/given-type';
import type { MemberGiven } from '#common/types/backend/parts/members/member-given';
import type { MemberGivenValue } from '#common/types/backend/parts/members/member-given-value';
import type { Role } from '#common/types/backend/parts/role';

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
  }): void {
    let result: Result.Result<void, ValidateGivenValuesResultError> =
      this.validateGivenValuesResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({
        message: result.error.code,
        displayData: result.error.displayData
      });
    }
  }

  validateGivenValuesResult(item: {
    type: GivenType;
    isMultiple: boolean;
    values: string[];
  }): Result.Result<void, ValidateGivenValuesResultError> {
    let { type, isMultiple, values } = item;

    let error: string = getGivenValueValidationError({
      type: type,
      isMultiple: isMultiple,
      values: values
    });

    if (isDefined(error)) {
      return Result.fail({
        code: 'BACKEND_WRONG_GIVEN_VALUE',
        displayData: {
          error: error
        }
      });
    }

    return Result.succeed();
  }

  async checkGivenDoesNotExistResult(item: {
    projectId: string;
    givenId: string;
  }): Result.ResultAsync<void, CheckGivenDoesNotExistResultError> {
    let { projectId, givenId } = item;

    let givenEnt: GivenEnt = await this.db.drizzle.query.givensTable.findFirst({
      where: and(
        eq(givensTable.projectId, projectId),
        eq(givensTable.givenId, givenId)
      )
    });

    return isDefined(givenEnt)
      ? Result.fail({ code: 'BACKEND_GIVEN_ALREADY_EXISTS' })
      : Result.succeed();
  }

  async getGivenCheckExists(item: {
    projectId: string;
    givenId: string;
  }): Promise<GivenTab> {
    let result: Result.Result<GivenTab, GetGivenCheckExistsResultError> =
      await this.getGivenCheckExistsResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let given: GivenTab = result.value;

    return given;
  }

  async getGivenCheckExistsResult(item: {
    projectId: string;
    givenId: string;
  }): Result.ResultAsync<GivenTab, GetGivenCheckExistsResultError> {
    let { projectId, givenId } = item;

    return this.db.drizzle.query.givensTable
      .findFirst({
        where: and(
          eq(givensTable.projectId, projectId),
          eq(givensTable.givenId, givenId)
        )
      })
      .then((givenEnt: GivenEnt) =>
        isUndefined(givenEnt)
          ? Result.fail({ code: 'BACKEND_GIVEN_DOES_NOT_EXIST' })
          : this.tabService.givenEntToTabResult({ givenEnt: givenEnt })
      );
  }

  async getApiGivens(item: { projectId: string }): Promise<Given[]> {
    let result: Result.Result<Given[], GetApiGivensResultError> =
      await this.getApiGivensResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let apiGivens: Given[] = result.value;

    return apiGivens;
  }

  async getApiGivensResult(item: {
    projectId: string;
  }): Result.ResultAsync<Given[], GetApiGivensResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'givens',
        (v): Result.ResultAsync<GivenTab[], GivenEntToTabResultError> =>
          this.db.drizzle.query.givensTable
            .findMany({ where: eq(givensTable.projectId, v.projectId) })
            .then(givenEnts =>
              Result.sequence(givenEnts, givenEnt =>
                this.tabService.givenEntToTabResult({ givenEnt: givenEnt })
              )
            )
      ),
      Result.map((v): Given[] =>
        v.givens
          .map(given => this.tabToApi({ given: given }))
          .sort((a, b) =>
            a.givenId > b.givenId ? 1 : b.givenId > a.givenId ? -1 : 0
          )
      )
    );
  }

  async getMemberGivensForSelection(item: {
    projectId: string;
    roles: string[];
  }): Promise<MemberGiven[]> {
    let result: Result.Result<
      MemberGiven[],
      GetMemberGivensForSelectionResultError
    > = await this.getMemberGivensForSelectionResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let memberGivens: MemberGiven[] = result.value;

    return memberGivens;
  }

  async getMemberGivensForSelectionResult(item: {
    projectId: string;
    roles: string[];
  }): Result.ResultAsync<
    MemberGiven[],
    GetMemberGivensForSelectionResultError
  > {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'apiGivens',
        (v): Result.ResultAsync<Given[], GetApiGivensResultError> =>
          this.getApiGivensResult({ projectId: v.projectId })
      ),
      Result.bind(
        'apiRoles',
        (v): Result.ResultAsync<Role[], GetApiRolesResultError> =>
          this.rolesService.getApiRolesResult({ projectId: v.projectId })
      ),
      Result.map((v): MemberGiven[] => {
        let memberRoles: Role[] = v.apiRoles.filter(role =>
          v.roles.includes(role.roleId)
        );

        let valueOriginsByGivenId: Record<
          string,
          Record<string, { isProjectDefault: boolean; roleIds: string[] }>
        > = {};

        let typeByGivenId: Record<string, GivenType> = {};

        let isMultipleByGivenId: Record<string, boolean> = {};

        v.apiGivens.forEach(given => {
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

              valueOriginsByGivenId[gv.givenId][value].roleIds.push(
                role.roleId
              );
            });
          });
        });

        let memberGivens: MemberGiven[] = Object.keys(valueOriginsByGivenId)
          .sort((a, b) => (a > b ? 1 : b > a ? -1 : 0))
          .map(givenId => {
            let valueOrigins = valueOriginsByGivenId[givenId];

            let memberGivenValues: MemberGivenValue[] = Object.keys(
              valueOrigins
            )
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

        return memberGivens;
      })
    );
  }
}
