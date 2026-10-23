import { Result } from '@praha/byethrow';
import { getApiGivens } from '#backend/functions/db/givens/get-api-givens/get-api-givens';
import type { DbService } from '#backend/services/db/db.service';
import type { RolesService } from '#backend/services/db/roles/roles.service';
import type { GetMemberGivensForSelectionError } from '#common/types/backend/function-errors/get-member-givens-for-selection-error';
import type { GivenType } from '#common/types/backend/parts/given/given-type';
import type { MemberGiven } from '#common/types/backend/parts/members/member-given';
import type { MemberGivenValue } from '#common/types/backend/parts/members/member-given-value';
import type { Role } from '#common/types/backend/parts/role';

export async function getMemberGivensForSelection(item: {
  rolesService: RolesService;
  db: DbService;
  projectId: string;
  roles: string[];
}): Result.ResultAsync<MemberGiven[], GetMemberGivensForSelectionError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('apiGivens', v =>
      getApiGivens({ db: v.db, projectId: v.projectId })
    ),
    Result.bind('apiRoles', v =>
      v.rolesService.getApiRoles({ projectId: v.projectId })
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

            valueOriginsByGivenId[gv.givenId][value].roleIds.push(role.roleId);
          });
        });
      });

      let memberGivens: MemberGiven[] = Object.keys(valueOriginsByGivenId)
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

      return memberGivens;
    })
  );
}
