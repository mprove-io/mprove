import { Result } from '@praha/byethrow';
import { makeUserAlias } from '#backend/functions/db/users/make-user-alias/make-user-alias';
import type { DbService } from '#backend/services/db/db.service';
import { ServerError } from '#common/classes/server-error/server-error';
import type { MakeUserAliasError } from '#common/types/backend/function-errors/make-user-alias-error';

export async function makeUserAliasUnwrap(item: {
  email: string;
  db: DbService;
}): Promise<string> {
  let { email } = item;

  let { db } = item;

  let result: Result.Result<string, MakeUserAliasError> = await makeUserAlias({
    email: email,
    db: db
  });

  if (Result.isFailure(result)) {
    throw new ServerError({ message: result.error.code });
  }

  let alias: string = result.value;

  return alias;
}
