import { Result } from '@praha/byethrow';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { CheckUserPasswordHashIsDefinedError } from '#common/types/backend/function-errors/check-user-password-hash-is-defined-error';

export function checkUserPasswordHashIsDefined(item: {
  user: UserTab;
}): Result.Result<void, CheckUserPasswordHashIsDefinedError> {
  let { user } = item;

  return isUndefined(user.passwordHash)
    ? Result.fail({ code: 'BACKEND_SIGN_UP_TO_SET_PASSWORD' })
    : Result.succeed();
}
