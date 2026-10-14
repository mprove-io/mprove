import { Result } from '@praha/byethrow';
import type { ValidateIdempUserError } from '#common/types/backend/function-errors/validate-idemp-user-error';

export function validateIdempUserResult(item: {
  storedUserId?: string;
  userId: string;
}): Result.Result<void, ValidateIdempUserError> {
  let { storedUserId, userId } = item;

  if (!!storedUserId && storedUserId !== userId) {
    return Result.fail({ code: 'BACKEND_IDEMP_USER_MISMATCH' });
  }

  return Result.succeed();
}
