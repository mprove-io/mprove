import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { GivenTab } from '#backend/drizzle/postgres/schema/_tabs';
import { givensTable } from '#backend/drizzle/postgres/schema/givens';
import { DbService } from '#backend/services/db/db.service';
import { RolesService } from '#backend/services/db/roles/roles.service';
import { HashService } from '#backend/services/hash/hash.service';
import { getGivenValueValidationError } from '#common/functions/get-given-value-validation-error/get-given-value-validation-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { CheckGivenDoesNotExistError } from '#common/types/backend/function-errors/check-given-does-not-exist-error';
import type { GetApiGivensError } from '#common/types/backend/function-errors/get-api-givens-error';
import type { GetMemberGivensForSelectionError } from '#common/types/backend/function-errors/get-member-givens-for-selection-error';
import type { ValidateGivenValuesError } from '#common/types/backend/function-errors/validate-given-values-error';
import type { Given } from '#common/types/backend/parts/given/given';
import type { GivenType } from '#common/types/backend/parts/given/given-type';
import type { MemberGiven } from '#common/types/backend/parts/members/member-given';
import type { MemberGivenValue } from '#common/types/backend/parts/members/member-given-value';
import type { Role } from '#common/types/backend/parts/role';

@Injectable()
export class GivensService {
  constructor(
    private hashService: HashService,
    private rolesService: RolesService,
    private db: DbService
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
  }): Result.Result<void, ValidateGivenValuesError> {
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

  async checkGivenDoesNotExist(item: {
    projectId: string;
    givenId: string;
  }): Result.ResultAsync<void, CheckGivenDoesNotExistError> {
    let { projectId, givenId } = item;

    let isGivenExist: boolean = await this.db.givens.isExistUnwrap({
      where: and(
        eq(givensTable.projectId, projectId),
        eq(givensTable.givenId, givenId)
      )
    });

    return isGivenExist
      ? Result.fail({ code: 'BACKEND_GIVEN_ALREADY_EXISTS' })
      : Result.succeed();
  }

  async getApiGivens(item: {
    projectId: string;
  }): Result.ResultAsync<Given[], GetApiGivensError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('givens', v =>
        this.db.givens.findMany({
          where: eq(givensTable.projectId, v.projectId)
        })
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
  }): Result.ResultAsync<MemberGiven[], GetMemberGivensForSelectionError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('apiGivens', v =>
        this.getApiGivens({ projectId: v.projectId })
      ),
      Result.bind('apiRoles', v =>
        this.rolesService.getApiRoles({ projectId: v.projectId })
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
