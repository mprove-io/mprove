import { Result } from '@praha/byethrow';
import { makeAlias } from '#backend/functions/db/users/make-alias/make-alias';
import type { DbService } from '#backend/services/db/db.service';
import { ServerError } from '#common/classes/server-error/server-error';
import type { MakeAliasError } from '#common/types/backend/function-errors/make-alias-error';

export async function makeAliasUnwrap(item: {
  email: string;
  db: DbService;
}): Promise<string> {
  let { email } = item;

  let { db } = item;

  let result: Result.Result<string, MakeAliasError> = await makeAlias({
    email: email,
    db: db
  });

  if (Result.isFailure(result)) {
    throw new ServerError({ message: result.error.code });
  }

  let alias: string = result.value;

  return alias;
}
