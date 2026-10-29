import { Result } from '@praha/byethrow';
import type { RoleTab } from '#backend/drizzle/postgres/tables/roles';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetRoleGivenCheckExistsError } from '#common/types/backend/function-errors/get-role-given-check-exists-error';
import type { Gv } from '#common/types/backend/parts/gv';

export function getRoleGivenCheckExists(item: {
  role: RoleTab;
  givenId: string;
}): Result.Result<Gv, GetRoleGivenCheckExistsError> {
  let { role, givenId } = item;

  let roleGiven: Gv = role.gvs.find(gv => gv.givenId === givenId);

  return isUndefined(roleGiven)
    ? Result.fail({ code: 'BACKEND_ROLE_GIVEN_DOES_NOT_EXIST' })
    : Result.succeed(roleGiven);
}
