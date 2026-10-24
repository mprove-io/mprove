import * as crypto from 'node:crypto';
import { Result } from '@praha/byethrow';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { MakeHashError } from '#common/types/backend/function-errors/make-hash-error';

export function makeHash(item: {
  input?: string;
  hashSecret?: string;
}): Result.Result<string, MakeHashError> {
  let { input, hashSecret } = item;

  if (isUndefined(input)) {
    return Result.succeed(undefined);
  }

  if (isUndefined(hashSecret)) {
    return Result.fail({
      code: 'BACKEND_HASH_SECRET_IS_NOT_DEFINED'
    });
  }

  let hash: string = crypto
    .createHmac('sha256', hashSecret)
    .update(input)
    .digest('hex');

  return Result.succeed(hash);
}
