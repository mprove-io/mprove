import type { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { usersTable } from '#backend/drizzle/postgres/tables/users';
import type { DbService } from '#backend/services/db/db.service';
import type { GetUserCheckExistsError } from '#common/types/backend/function-errors/get-user-check-exists-error';

export async function getUserCheckExists(item: {
  userId: string;
  db: DbService;
}): Result.ResultAsync<UserTab, GetUserCheckExistsError> {
  let { userId, db } = item;

  return db.users.findFirstCheckExists({
    where: eq(usersTable.userId, userId)
  });
}
