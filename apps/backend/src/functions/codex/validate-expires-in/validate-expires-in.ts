import { Result } from '@praha/byethrow';
import { CODEX_AUTH_REFRESH_BUFFER_SEC } from '#backend/functions/codex/prewarm-codex-auth/prewarm-codex-auth';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ValidateExpiresInError } from '#common/types/backend/function-errors/validate-expires-in-error';

export function validateExpiresIn(item: {
  expiresIn?: number;
}): Result.Result<number, ValidateExpiresInError> {
  let { expiresIn } = item;

  if (isUndefined(expiresIn)) {
    return Result.fail({
      code: 'BACKEND_CODEX_AUTH_TOKEN_EXPIRES_IN_IS_MISSING'
    });
  }

  if (expiresIn < CODEX_AUTH_REFRESH_BUFFER_SEC) {
    return Result.fail({
      code: 'BACKEND_CODEX_AUTH_TOKEN_EXPIRES_IN_IS_TOO_SHORT',
      customData: {
        expiresInSec: expiresIn,
        minExpiresInSec: CODEX_AUTH_REFRESH_BUFFER_SEC
      }
    });
  }

  return Result.succeed(expiresIn);
}
