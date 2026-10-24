import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { getDconfigHashSecret } from '#backend/functions/db/dconfigs/get-dconfig-hash-secret/get-dconfig-hash-secret';
import { makeHash } from '#backend/functions/hash/make-hash/make-hash';
import type { DbService } from '#backend/services/db/db.service';
import type { GetUserByEmailCheckExistsError } from '#common/types/backend/function-errors/get-user-by-email-check-exists-error';

export async function getUserByEmailCheckExists(item: {
  email: string;
  db: DbService;
}): Result.ResultAsync<UserTab, GetUserByEmailCheckExistsError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('hashSecret', v => getDconfigHashSecret({ db: v.db })),
    Result.bind('emailHash', v =>
      makeHash({
        input: v.email,
        hashSecret: v.hashSecret
      })
    ),
    Result.andThen(v =>
      v.db.users.findFirstCheckExists({
        where: eq(usersTable.emailHash, v.emailHash)
      })
    )
  );
}
