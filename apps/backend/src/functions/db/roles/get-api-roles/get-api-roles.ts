import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import { rolesTable } from '#backend/drizzle/postgres/schema/roles';
import { roleTabToApi } from '#backend/functions/db/roles/get-api-roles/role-tab-to-api/role-tab-to-api';
import type { DbService } from '#backend/services/db/db.service';
import type { GetApiRolesError } from '#common/types/backend/function-errors/get-api-roles-error';
import type { Role } from '#common/types/backend/parts/role';

export async function getApiRoles(item: {
  projectId: string;
  db: DbService;
}): Result.ResultAsync<Role[], GetApiRolesError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('roles', v =>
      v.db.roles.findMany({
        where: eq(rolesTable.projectId, v.projectId)
      })
    ),
    Result.map((v): Role[] =>
      v.roles
        .map(role =>
          roleTabToApi({
            role: role
          })
        )
        .sort((a, b) =>
          a.roleId > b.roleId ? 1 : b.roleId > a.roleId ? -1 : 0
        )
    )
  );
}
