import { Result } from '@praha/byethrow';
import retry, { type Options } from 'async-retry';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { BackendError } from '#common/types/backend/errors/backend-error';
import type { RetryError } from '#common/types/backend/function-errors/retry-error';

type RetryFailure<AttemptError> = {
  exception: Error;
  failure: Result.Failure<AttemptError>;
};

export async function retryResult<
  AttemptError extends { code: BackendError['code'] }
>(item: {
  action: () => Result.ResultAsync<void, AttemptError>;
  options: Options;
}): Result.ResultAsync<void, RetryError<AttemptError>> {
  let { action, options } = item;

  let failures: RetryFailure<AttemptError>[] = [];

  try {
    await retry(async () => {
      let result: Result.Result<void, AttemptError> = await action();

      if (Result.isFailure(result)) {
        let exception: ServerError = new ServerError({
          message: result.error.code,
          displayData:
            'displayData' in result.error
              ? result.error.displayData
              : undefined,
          customData:
            'customData' in result.error ? result.error.customData : undefined,
          originalError:
            'originalError' in result.error
              ? result.error.originalError
              : undefined
        });

        failures.push({ exception: exception, failure: result });

        // Keep the existing retry policy; unwrap only identity-matched failures
        // after retry exhaustion, without classifying unexpected exceptions.
        throw exception;
      }
    }, options);

    return Result.succeed();
  } catch (error) {
    let failure: Result.Failure<AttemptError> = failures.find(
      candidate => candidate.exception === error
    )?.failure;

    if (isDefined(failure)) {
      return failure;
    }

    throw error;
  }
}
