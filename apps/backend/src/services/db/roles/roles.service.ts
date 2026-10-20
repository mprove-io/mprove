import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type { RoleTab } from '#backend/drizzle/postgres/schema/_tabs';
import { rolesTable } from '#backend/drizzle/postgres/schema/roles';
import { DbService } from '#backend/services/db/db.service';
import { HashService } from '#backend/services/hash/hash.service';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { CheckRoleDoesNotExistError } from '#common/types/backend/function-errors/check-role-does-not-exist-error';
import type { CheckRoleGivenDoesNotExistError } from '#common/types/backend/function-errors/check-role-given-does-not-exist-error';
import type { CheckRolesExistError } from '#common/types/backend/function-errors/check-roles-exist-error';
import type { DbRolesFindManyError } from '#common/types/backend/function-errors/db/roles/db-roles-find-many-error';
import type { GetApiRolesError } from '#common/types/backend/function-errors/get-api-roles-error';
import type { GetRoleGivenCheckExistsError } from '#common/types/backend/function-errors/get-role-given-check-exists-error';
import type { Gv } from '#common/types/backend/parts/gv';
import type { Role } from '#common/types/backend/parts/role';

@Injectable()
export class RolesService {
  constructor(
    private hashService: HashService,
    private db: DbService
  ) {}

  makeRole(item: { projectId: string; roleId: string; gvs: Gv[] }): RoleTab {
    let { projectId, roleId, gvs } = item;

    let role: RoleTab = {
      roleFullId: this.hashService.makeRoleFullId({
        projectId: projectId,
        roleId: roleId
      }),
      projectId: projectId,
      roleId: roleId,
      gvs: gvs,
      keyTag: undefined,
      serverTs: undefined
    };

    return role;
  }

  tabToApi(item: { role: RoleTab }): Role {
    let { role } = item;

    let apiRole: Role = {
      projectId: role.projectId,
      roleId: role.roleId,
      gvs: role.gvs.sort((a, b) =>
        a.givenId > b.givenId ? 1 : b.givenId > a.givenId ? -1 : 0
      )
    };

    return apiRole;
  }

  async checkRoleDoesNotExist(item: {
    projectId: string;
    roleId: string;
  }): Result.ResultAsync<void, CheckRoleDoesNotExistError> {
    let { projectId, roleId } = item;

    let isRoleExist: boolean = await this.db.roles.isExistUnwrap({
      where: and(
        eq(rolesTable.projectId, projectId),
        eq(rolesTable.roleId, roleId)
      )
    });

    return isRoleExist
      ? Result.fail({ code: 'BACKEND_ROLE_ALREADY_EXISTS' })
      : Result.succeed();
  }

  async checkRolesExist(item: {
    projectId: string;
    roleIds: string[];
  }): Result.ResultAsync<void, CheckRolesExistError> {
    let { projectId, roleIds } = item;

    let uniqueRoleIds: string[] = [];

    roleIds.forEach(roleId => {
      if (uniqueRoleIds.indexOf(roleId) < 0) {
        uniqueRoleIds.push(roleId);
      }
    });

    if (uniqueRoleIds.length === 0) {
      return Result.succeed();
    }

    let rolesResult: Result.Result<RoleTab[], DbRolesFindManyError> =
      await this.db.roles.findMany({
        where: and(
          eq(rolesTable.projectId, projectId),
          inArray(rolesTable.roleId, uniqueRoleIds)
        )
      });

    if (Result.isFailure(rolesResult)) {
      return rolesResult;
    }

    let roles: RoleTab[] = rolesResult.value;

    let existingRoleIds: string[] = roles.map(role => role.roleId);

    let missingRoleIds: string[] = uniqueRoleIds
      .filter(roleId => existingRoleIds.indexOf(roleId) < 0)
      .sort((a, b) => (a > b ? 1 : b > a ? -1 : 0));

    if (missingRoleIds.length > 0) {
      return Result.fail({
        code: 'BACKEND_ROLES_DO_NOT_EXIST',
        displayData: {
          roles: missingRoleIds
        }
      });
    }

    return Result.succeed();
  }

  checkRoleGivenDoesNotExist(item: {
    role: RoleTab;
    givenId: string;
  }): Result.Result<void, CheckRoleGivenDoesNotExistError> {
    let { role, givenId } = item;

    return role.gvs.some(gv => gv.givenId === givenId)
      ? Result.fail({ code: 'BACKEND_ROLE_GIVEN_ALREADY_EXISTS' })
      : Result.succeed();
  }

  getRoleGivenCheckExists(item: {
    role: RoleTab;
    givenId: string;
  }): Result.Result<Gv, GetRoleGivenCheckExistsError> {
    let { role, givenId } = item;

    let roleGiven: Gv = role.gvs.find(gv => gv.givenId === givenId);

    return isUndefined(roleGiven)
      ? Result.fail({ code: 'BACKEND_ROLE_GIVEN_DOES_NOT_EXIST' })
      : Result.succeed(roleGiven);
  }

  async getApiRoles(item: {
    projectId: string;
  }): Result.ResultAsync<Role[], GetApiRolesError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'roles',
        (v): Result.ResultAsync<RoleTab[], DbRolesFindManyError> =>
          this.db.roles.findMany({
            where: eq(rolesTable.projectId, v.projectId)
          })
      ),
      Result.map((v): Role[] =>
        v.roles
          .map(role => this.tabToApi({ role: role }))
          .sort((a, b) =>
            a.roleId > b.roleId ? 1 : b.roleId > a.roleId ? -1 : 0
          )
      )
    );
  }
}
