import { Result } from '@praha/byethrow';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { RESTRICTED_USER_ALIAS } from '#common/constants/top';
import type { CheckUserIsNotRestrictedError } from '#common/types/backend/function-errors/check-user-is-not-restricted-error';

export function checkUserIsNotRestricted(item: {
  user: UserTab;
}): Result.Result<void, CheckUserIsNotRestrictedError> {
  let { user } = item;

  return user.alias === RESTRICTED_USER_ALIAS
    ? Result.fail({ code: 'BACKEND_RESTRICTED_USER' })
    : Result.succeed();
}
