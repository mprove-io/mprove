import { Result } from '@praha/byethrow';
import type { z } from 'zod';
import { ServerError } from '#common/classes/server-error/server-error';
import {
  type DbErrorToError,
  zDbErrorToError
} from '#common/types/backend/function-errors/db-error-to-error';

/**
 * Compatibility adapter for legacy throwing DB conversions. Validate the
 * original domain failure instead of reconstructing it from an error message.
 * Prefer retryTransactionResult with Result-returning operations for new code.
 */
export async function dbErrorToResult<Output = void>(item: {
  action: () => Promise<Output>;
}): Result.ResultAsync<Output, DbErrorToError> {
  let { action } = item;

  try {
    let output: Output = await action();

    // The generic overload may return a promise when Output is promise-like.
    return await Result.succeed(output);
  } catch (error) {
    if (error instanceof ServerError) {
      let parsed: z.ZodSafeParseResult<DbErrorToError> =
        zDbErrorToError.safeParse(error.originalError);

      if (parsed.success) {
        return Result.fail(parsed.data);
      }
    }

    // Unknown errors remain exceptions, preserving their stack and cause.
    throw error;
  }
}
