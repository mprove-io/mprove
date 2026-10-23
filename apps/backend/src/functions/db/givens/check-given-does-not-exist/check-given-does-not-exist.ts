import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import { givensTable } from '#backend/drizzle/postgres/schema/givens';
import type { DbService } from '#backend/services/db/db.service';
import type { CheckGivenDoesNotExistError } from '#common/types/backend/function-errors/check-given-does-not-exist-error';

export async function checkGivenDoesNotExist(item: {
  db: DbService;
  projectId: string;
  givenId: string;
}): Result.ResultAsync<void, CheckGivenDoesNotExistError> {
  let { db, projectId, givenId } = item;

  let isGivenExist: boolean = await db.givens.isExistUnwrap({
    where: and(
      eq(givensTable.projectId, projectId),
      eq(givensTable.givenId, givenId)
    )
  });

  return isGivenExist
    ? Result.fail({ code: 'BACKEND_GIVEN_ALREADY_EXISTS' })
    : Result.succeed();
}
