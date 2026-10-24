import { Result } from '@praha/byethrow';
import { makeHash } from '#backend/functions/hash/make-hash/make-hash';
import { ServerError } from '#common/classes/server-error/server-error';
import type { MakeHashError } from '#common/types/backend/function-errors/make-hash-error';

export function makeHashUnwrap(item: {
  input: string;
  hashSecret: string;
}): string {
  let result: Result.Result<string, MakeHashError> = makeHash({
    input: item.input,
    hashSecret: item.hashSecret
  });

  if (Result.isFailure(result)) {
    throw new ServerError({ message: result.error.code });
  }

  let hash: string = result.value;

  return hash;
}
