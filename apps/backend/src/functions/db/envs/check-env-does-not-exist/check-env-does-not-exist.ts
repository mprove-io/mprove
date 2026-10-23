import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import { envsTable } from '#backend/drizzle/postgres/schema/envs';
import type { DbService } from '#backend/services/db/db.service';
import type { CheckEnvDoesNotExistError } from '#common/types/backend/function-errors/check-env-does-not-exist-error';

export async function checkEnvDoesNotExist(item: {
  db: DbService;
  projectId: string;
  envId: string;
}): Result.ResultAsync<void, CheckEnvDoesNotExistError> {
  let { db, projectId, envId } = item;

  let isEnvExist: boolean = await db.envs.isExistUnwrap({
    where: and(eq(envsTable.envId, envId), eq(envsTable.projectId, projectId))
  });

  if (isEnvExist) {
    return Result.fail({
      code: 'BACKEND_ENV_ALREADY_EXISTS'
    });
  }

  return Result.succeed();
}
