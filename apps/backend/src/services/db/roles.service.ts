import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { RoleTab } from '#backend/drizzle/postgres/schema/_tabs';
import { rolesTable } from '#backend/drizzle/postgres/schema/roles';
import { ServerError } from '#common/classes/server-error/server-error';
import { ErEnum } from '#common/enums/er.enum';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Gv } from '#common/zod/backend/gv';
import type { Role } from '#common/zod/backend/role';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

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

  async checkRoleDoesNotExist(item: { projectId: string; roleId: string }) {
    let { projectId, roleId } = item;

    let role = await this.db.drizzle.query.rolesTable.findFirst({
      where: and(
        eq(rolesTable.projectId, projectId),
        eq(rolesTable.roleId, roleId)
      )
    });

    if (isDefined(role)) {
      throw new ServerError({
        message: ErEnum.BACKEND_ROLE_ALREADY_EXISTS
      });
    }
  }

  async getRoleCheckExists(item: { projectId: string; roleId: string }) {
    let { projectId, roleId } = item;

    let role = await this.db.drizzle.query.rolesTable
      .findFirst({
        where: and(
          eq(rolesTable.projectId, projectId),
          eq(rolesTable.roleId, roleId)
        )
      })
      .then(x => this.tabService.roleEntToTab(x));

    if (isUndefined(role)) {
      throw new ServerError({
        message: ErEnum.BACKEND_ROLE_DOES_NOT_EXIST
      });
    }

    return role;
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
        message: ErEnum.BACKEND_ROLES_DO_NOT_EXIST,
        displayData: {
          roles: missingRoleIds
        }
      });
    }
  }

  checkRoleGivenDoesNotExist(item: { role: RoleTab; givenId: string }) {
    let { role, givenId } = item;

    let roleGiven = role.gvs.find(x => x.givenId === givenId);

    if (isDefined(roleGiven)) {
      throw new ServerError({
        message: ErEnum.BACKEND_ROLE_GIVEN_ALREADY_EXISTS
      });
    }
  }

  getRoleGivenCheckExists(item: { role: RoleTab; givenId: string }) {
    let { role, givenId } = item;

    let roleGiven = role.gvs.find(x => x.givenId === givenId);

    if (isUndefined(roleGiven)) {
      throw new ServerError({
        message: ErEnum.BACKEND_ROLE_GIVEN_DOES_NOT_EXIST
      });
    }

    return roleGiven;
  }

  async getRoles(item: { projectId: string }) {
    let { projectId } = item;

    let roles = await this.db.drizzle.query.rolesTable
      .findMany({
        where: eq(rolesTable.projectId, projectId)
      })
      .then(xs => xs.map(x => this.tabService.roleEntToTab(x)));

    return roles;
  }

  async getApiRoles(item: { projectId: string }) {
    let { projectId } = item;

    let roles = await this.db.drizzle.query.rolesTable
      .findMany({
        where: eq(rolesTable.projectId, projectId)
      })
      .then(xs => xs.map(x => this.tabService.roleEntToTab(x)));

    let apiRoles = roles
      .map(role => this.tabToApi({ role: role }))
      .sort((a, b) => (a.roleId > b.roleId ? 1 : b.roleId > a.roleId ? -1 : 0));

    return apiRoles;
  }
}
