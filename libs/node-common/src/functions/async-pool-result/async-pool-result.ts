import { Result } from '@praha/byethrow';
import asyncPool from 'tiny-async-pool';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { AsyncPoolError } from '#common/types/backend/function-errors/async-pool-error';

export async function asyncPoolResult<Input, Output, Error>(item: {
  poolSize: number;
  inputs: Input[];
  callback: (input: Input) => Result.ResultAsync<Output, Error>;
}): Result.ResultAsync<Output[], AsyncPoolError<Error>> {
  let { poolSize, inputs, callback } = item;

  let failures: Result.Failure<Error>[] = [];

  try {
    let outputs: Output[] = await asyncPool(
      poolSize,
      inputs,
      async (input: Input) => {
        let result: Result.Result<Output, Error> = await callback(input);

        if (Result.isFailure(result)) {
          failures.push(result);

          // Preserve asyncPool's first-rejection scheduling without classifying
          // unexpected exceptions as anticipated callback failures.
          throw result;
        }

        let output: Output = result.value;

        return output;
      }
    );

    return Result.succeed(outputs);
  } catch (error) {
    let failure: Result.Failure<Error> = failures.find(x => x === error);

    if (isDefined(failure)) {
      return failure;
    }

    throw error;
  }
}
