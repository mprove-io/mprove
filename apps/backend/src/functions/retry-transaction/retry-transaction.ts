import { Result } from '@praha/byethrow';
import type { Options } from 'async-retry';
import type { Db } from '#backend/drizzle/drizzle.module';
import type { PackerInput } from '#backend/drizzle/postgres/drizzle-packer';
import { customRetry } from '#backend/functions/custom-retry/custom-retry';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { RetryTransactionError } from '#common/types/backend/function-errors/retry-transaction-error';

export async function retryTransaction<Success, Failure>(item: {
  db: Db;
  options: Options;
  action: (item: {
    tx: PackerInput['tx'];
  }) => Result.ResultAsync<Success, Failure>;
}): Result.ResultAsync<Success, RetryTransactionError<Failure>> {
  let { db, options, action } = item;

  return customRetry({
    options: options,
    action: async (): Result.ResultAsync<Success, Failure> => {
      let rollbackSignal: Error & { cause?: Failure } = new Error(
        'Transaction domain failure'
      );

      let state: { failure?: Result.Failure<Failure> } = {};

      try {
        let success: Result.Success<Success> = await db.drizzle.transaction(
          async (tx): Promise<Result.Success<Success>> => {
            let result: Result.Result<Success, Failure> = await action({
              tx: tx
            });

            if (Result.isFailure(result)) {
              state.failure = result;

              rollbackSignal.cause = result.error;

              throw rollbackSignal;
            }

            return result;
          }
        );

        return success;
      } catch (error: unknown) {
        if (error === rollbackSignal && isDefined(state.failure)) {
          return state.failure;
        }

        throw error;
      }
    }
  });
}
