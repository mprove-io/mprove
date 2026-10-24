import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type { RoleTab } from '#backend/drizzle/postgres/schema/_tabs';
import { rolesTable } from '#backend/drizzle/postgres/schema/roles';
import type { DbService } from '#backend/services/db/db.service';
import type { CheckRolesExistError } from '#common/types/backend/function-errors/check-roles-exist-error';
import type { DbRolesFindManyError } from '#common/types/backend/function-errors/db/roles/db-roles-find-many-error';

export async function checkRolesExist(item: {
  projectId: string;
  roleIds: string[];
  db: DbService;
}): Result.ResultAsync<void, CheckRolesExistError> {
  let { projectId, roleIds, db } = item;

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
    await db.roles.findMany({
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
