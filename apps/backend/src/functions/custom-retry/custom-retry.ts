import { Result } from '@praha/byethrow';
import asyncRetry, { type Options } from 'async-retry';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { CustomRetryError } from '#common/types/backend/function-errors/custom-retry-error';

export async function customRetry<Success, Failure>(item: {
  action: () => Result.ResultAsync<Success, Failure>;
  options: Options;
}): Result.ResultAsync<Success, CustomRetryError<Failure>> {
  let { action, options } = item;

  let failureSignal: Error & { cause?: Failure } = new Error(
    'Result operation failed'
  );

  let state: { failure?: Result.Failure<Failure> } = {};

  try {
    let success: Result.Success<Success> = await asyncRetry(
      async (): Promise<Result.Success<Success>> => {
        state.failure = undefined;

        let result: Result.Result<Success, Failure> = await action();

        if (Result.isFailure(result)) {
          state.failure = result;

          failureSignal.cause = result.error;

          failureSignal.message = 'Result operation failed';

          if (
            typeof result.error === 'object' &&
            result.error !== null &&
            'code' in result.error &&
            typeof result.error.code === 'string'
          ) {
            failureSignal.message = result.error.code;
          }

          // Keep the existing retry policy; unwrap only identity-matched failures
          // after retry exhaustion, without classifying unexpected exceptions.
          throw failureSignal;
        }

        return result;
      },
      options
    );

    return success;
  } catch (error: unknown) {
    if (error === failureSignal && isDefined(state.failure)) {
      return state.failure;
    }

    throw error;
  }
}
