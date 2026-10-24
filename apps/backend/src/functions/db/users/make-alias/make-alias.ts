import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { getDconfigHashSecret } from '#backend/functions/db/dconfigs/get-dconfig-hash-secret/get-dconfig-hash-secret';
import { makeHash } from '#backend/functions/hash/make-hash/make-hash';
import type { DbService } from '#backend/services/db/db.service';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { MakeAliasError } from '#common/types/backend/function-errors/make-alias-error';
import type { MakeHashError } from '#common/types/backend/function-errors/make-hash-error';

export async function makeAlias(item: {
  email: string;
  db: DbService;
}): Result.ResultAsync<string, MakeAliasError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('alias', v => {
      let reg: RegExp = MyRegex.CAPTURE_ALIAS();

      let match: RegExpExecArray = reg.exec(v.email);

      let alias: string = match ? match[1] : undefined;

      return isUndefined(alias)
        ? Result.fail({ code: 'BACKEND_USER_ALIAS_IS_UNDEFINED' })
        : Result.succeed(alias);
    }),
    Result.bind('hashSecret', v => getDconfigHashSecret({ db: v.db })),
    Result.andThen(async v => {
      let alias: string = v.alias;

      let count = 2;

      let isRestart = true;

      while (isRestart) {
        let aliasHashResult: Result.Result<string, MakeHashError> = makeHash({
          input: alias,
          hashSecret: v.hashSecret
        });

        if (Result.isFailure(aliasHashResult)) {
          return Result.fail(aliasHashResult.error);
        }

        let isAliasUserExist: boolean = await v.db.users.isExistUnwrap({
          where: eq(usersTable.aliasHash, aliasHashResult.value)
        });

        if (isAliasUserExist) {
          alias = `${alias}${count}`;

          count++;
        } else {
          isRestart = false;
        }
      }

      return Result.succeed(alias);
    })
  );
}
