import { Result } from '@praha/byethrow';
import type { RoleTab } from '#backend/drizzle/postgres/tables/roles';
import type { CheckRoleGivenDoesNotExistError } from '#common/types/backend/function-errors/check-role-given-does-not-exist-error';

export function checkRoleGivenDoesNotExist(item: {
  role: RoleTab;
  givenId: string;
}): Result.Result<void, CheckRoleGivenDoesNotExistError> {
  let { role, givenId } = item;

  return role.gvs.some(gv => gv.givenId === givenId)
    ? Result.fail({ code: 'BACKEND_ROLE_GIVEN_ALREADY_EXISTS' })
    : Result.succeed();
}
