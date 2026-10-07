import { Result } from '@praha/byethrow';
import { ServerError } from '#common/classes/server-error/server-error';
import type { DbErrorToResultError } from '#common/types/backend/function-errors/db-error-to-result-error';

/**
 * Pass the entire transaction/retry operation as action so known domain errors
 * are converted only after rollback and retries finish.
 */
export async function dbErrorToResult(item: {
  action: () => Promise<void>;
}): Result.ResultAsync<void, DbErrorToResultError> {
  let { action } = item;

  try {
    await action();

    return Result.succeed();
  } catch (error) {
    if (error instanceof ServerError) {
      switch (error.message) {
        case 'BACKEND_HASH_SECRET_IS_NOT_DEFINED':
        case 'BACKEND_DB_RECORD_HAS_NO_DECRYPTED_AND_NO_ENCRYPTED_PROPS':
        case 'BACKEND_DB_RECORD_HAS_BOTH_DECRYPTED_AND_ENCRYPTED_PROPS':
        case 'BACKEND_DB_RECORD_IS_DECRYPTED_BUT_HAS_KEY_TAG':
        case 'BACKEND_DB_RECORD_KEY_TAG_DOES_NOT_MATCH_CURRENT_OR_PREV':
          return Result.fail({ code: error.message });
      }
    }

    // Unknown errors remain exceptions, preserving their stack and cause.
    throw error;
  }
}
