import { Result } from '@praha/byethrow';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { schemaPostgres } from '#backend/drizzle/postgres/schema-postgres';
import type { DbTransaction } from '#backend/services/db/db-transaction';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { TransactionError } from '#common/types/backend/function-errors/transaction-error';

export async function transaction<Success, Failure>(item: {
  drizzle: NodePgDatabase<typeof schemaPostgres>;
  action: (tx: DbTransaction) => Result.ResultAsync<Success, Failure>;
}): Result.ResultAsync<Success, TransactionError<Failure>> {
  let { drizzle, action } = item;

  let rollbackSignal: Error & { cause?: Failure } = new Error(
    'Transaction domain failure'
  );

  let state: { failure?: Result.Failure<Failure> } = {};

  try {
    let success: Result.Success<Success> = await drizzle.transaction(
      async (tx): Promise<Result.Success<Success>> => {
        let result: Result.Result<Success, Failure> = await action(tx);

        if (Result.isFailure(result)) {
          state.failure = result;

          rollbackSignal.cause = result.error;

          // A normally returned failure would commit the transaction.
          throw rollbackSignal;
        }

        return result;
      }
    );

    return success;
  } catch (error: unknown) {
    // Only translate our own rollback signal; infrastructure errors still throw.
    if (error === rollbackSignal && isDefined(state.failure)) {
      return state.failure;
    }

    throw error;
  }
}
