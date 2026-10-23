import { Result } from '@praha/byethrow';
import { getDconfigHashSecret } from '#backend/functions/db/dconfigs/get-dconfig-hash-secret/get-dconfig-hash-secret';
import type { DbService } from '#backend/services/db/db.service';
import { ServerError } from '#common/classes/server-error/server-error';
import type { GetDconfigHashSecretError } from '#common/types/backend/function-errors/get-dconfig-hash-secret-error';

export async function getDconfigHashSecretUnwrap(item: {
  db: DbService;
}): Promise<string> {
  let { db } = item;

  let result: Result.Result<string, GetDconfigHashSecretError> =
    await getDconfigHashSecret({ db: db });

  if (Result.isFailure(result)) {
    throw new ServerError({ message: result.error.code });
  }

  let hashSecret: string = result.value;

  return hashSecret;
}
