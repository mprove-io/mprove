import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import { rolesTable } from '#backend/drizzle/postgres/tables/roles';
import type { DbService } from '#backend/services/db/db.service';
import type { CheckRoleDoesNotExistError } from '#common/types/backend/function-errors/check-role-does-not-exist-error';

export async function checkRoleDoesNotExist(item: {
  projectId: string;
  roleId: string;
  db: DbService;
}): Result.ResultAsync<void, CheckRoleDoesNotExistError> {
  let { projectId, roleId, db } = item;

  let isRoleExist: boolean = await db.roles.isExistUnwrap({
    where: and(
      eq(rolesTable.projectId, projectId),
      eq(rolesTable.roleId, roleId)
    )
  });

  return isRoleExist
    ? Result.fail({ code: 'BACKEND_ROLE_ALREADY_EXISTS' })
    : Result.succeed();
}
