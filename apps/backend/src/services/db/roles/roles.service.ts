import { Inject, Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { RoleTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  type RoleEnt,
  rolesTable
} from '#backend/drizzle/postgres/schema/roles';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { CheckRoleDoesNotExistResultError } from '#common/types/backend/function-errors/check-role-does-not-exist-result-error';
import type { CheckRoleGivenDoesNotExistResultError } from '#common/types/backend/function-errors/check-role-given-does-not-exist-result-error';
import type { GetApiRolesResultError } from '#common/types/backend/function-errors/get-api-roles-result-error';
import type { GetRoleCheckExistsResultError } from '#common/types/backend/function-errors/get-role-check-exists-result-error';
import type { GetRoleGivenCheckExistsResultError } from '#common/types/backend/function-errors/get-role-given-check-exists-result-error';
import type { GetRolesResultError } from '#common/types/backend/function-errors/get-roles-result-error';
import type { RoleEntToTabResultError } from '#common/types/backend/function-errors/role-ent-to-tab-result-error';
import type { Gv } from '#common/types/backend/parts/gv';
import type { Role } from '#common/types/backend/parts/role';

@Injectable()
export class RolesService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    @Inject(DRIZZLE) private db: Db
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

  async checkRoleDoesNotExistResult(item: {
    projectId: string;
    roleId: string;
  }): Result.ResultAsync<void, CheckRoleDoesNotExistResultError> {
    let { projectId, roleId } = item;

    let roleEnt: RoleEnt = await this.db.drizzle.query.rolesTable.findFirst({
      where: and(
        eq(rolesTable.projectId, projectId),
        eq(rolesTable.roleId, roleId)
      )
    });

    return isDefined(roleEnt)
      ? Result.fail({ code: 'BACKEND_ROLE_ALREADY_EXISTS' })
      : Result.succeed();
  }

  async getRoleCheckExistsResult(item: {
    projectId: string;
    roleId: string;
  }): Result.ResultAsync<RoleTab, GetRoleCheckExistsResultError> {
    let { projectId, roleId } = item;

    return this.db.drizzle.query.rolesTable
      .findFirst({
        where: and(
          eq(rolesTable.projectId, projectId),
          eq(rolesTable.roleId, roleId)
        )
      })
      .then((roleEnt: RoleEnt) =>
        isUndefined(roleEnt)
          ? Result.fail({ code: 'BACKEND_ROLE_DOES_NOT_EXIST' })
          : this.tabService.roleEntToTabResult({ roleEnt: roleEnt })
      );
  }

  async checkRolesExist(item: { projectId: string; roleIds: string[] }) {
    let { projectId, roleIds } = item;

    let uniqueRoleIds: string[] = [];

    roleIds.forEach(roleId => {
      if (uniqueRoleIds.indexOf(roleId) < 0) {
        uniqueRoleIds.push(roleId);
      }
    });

    if (uniqueRoleIds.length === 0) {
      return;
    }

    let roles = await this.db.drizzle.query.rolesTable.findMany({
      where: and(
        eq(rolesTable.projectId, projectId),
        inArray(rolesTable.roleId, uniqueRoleIds)
      )
    });

    let existingRoleIds = roles.map(role => role.roleId);

    let missingRoleIds = uniqueRoleIds
      .filter(roleId => existingRoleIds.indexOf(roleId) < 0)
      .sort((a, b) => (a > b ? 1 : b > a ? -1 : 0));

    if (missingRoleIds.length > 0) {
      throw new ServerError({
        message: 'BACKEND_ROLES_DO_NOT_EXIST',
        displayData: {
          roles: missingRoleIds
        }
      });
    }
  }

  checkRoleGivenDoesNotExistResult(item: {
    role: RoleTab;
    givenId: string;
  }): Result.Result<void, CheckRoleGivenDoesNotExistResultError> {
    let { role, givenId } = item;

    return role.gvs.some(gv => gv.givenId === givenId)
      ? Result.fail({ code: 'BACKEND_ROLE_GIVEN_ALREADY_EXISTS' })
      : Result.succeed();
  }

  getRoleGivenCheckExistsResult(item: {
    role: RoleTab;
    givenId: string;
  }): Result.Result<Gv, GetRoleGivenCheckExistsResultError> {
    let { role, givenId } = item;

    let roleGiven: Gv = role.gvs.find(gv => gv.givenId === givenId);

    return isUndefined(roleGiven)
      ? Result.fail({ code: 'BACKEND_ROLE_GIVEN_DOES_NOT_EXIST' })
      : Result.succeed(roleGiven);
  }

  async getRolesResult(item: {
    projectId: string;
  }): Result.ResultAsync<RoleTab[], GetRolesResultError> {
    let { projectId } = item;

    return this.db.drizzle.query.rolesTable
      .findMany({
        where: eq(rolesTable.projectId, projectId)
      })
      .then(roleEnts =>
        Result.sequence(roleEnts, roleEnt =>
          this.tabService.roleEntToTabResult({ roleEnt: roleEnt })
        )
      );
  }

  async getApiRoles(item: { projectId: string }): Promise<Role[]> {
    let result: Result.Result<Role[], GetApiRolesResultError> =
      await this.getApiRolesResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let apiRoles: Role[] = result.value;

    return apiRoles;
  }

  async getApiRolesResult(item: {
    projectId: string;
  }): Result.ResultAsync<Role[], GetApiRolesResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'roles',
        (v): Result.ResultAsync<RoleTab[], RoleEntToTabResultError> =>
          this.db.drizzle.query.rolesTable
            .findMany({ where: eq(rolesTable.projectId, v.projectId) })
            .then(roleEnts =>
              Result.sequence(roleEnts, roleEnt =>
                this.tabService.roleEntToTabResult({ roleEnt: roleEnt })
              )
            )
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
