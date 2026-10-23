import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { EnvTab, MemberTab } from '#backend/drizzle/postgres/schema/_tabs';
import { envsTable } from '#backend/drizzle/postgres/schema/envs';
import type { DbService } from '#backend/services/db/db.service';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { DbEnvsFindFirstError } from '#common/types/backend/function-errors/db/envs/db-envs-find-first-error';
import type { GetEnvCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-env-check-exists-and-access-error';

export async function getEnvCheckExistsAndAccess(item: {
  db: DbService;
  projectId: string;
  envId: string;
  member: MemberTab;
}): Result.ResultAsync<EnvTab, GetEnvCheckExistsAndAccessError> {
  let { db, projectId, envId, member } = item;

  let envResult: Result.Result<EnvTab, DbEnvsFindFirstError> =
    await db.envs.findFirst({
      where: and(eq(envsTable.envId, envId), eq(envsTable.projectId, projectId))
    });

  if (Result.isFailure(envResult)) {
    return envResult;
  }

  let env: EnvTab = envResult.value;

  if (isUndefined(env)) {
    return Result.fail({
      code: 'BACKEND_ENV_DOES_NOT_EXIST'
    });
  }

  if (envId !== PROJECT_ENV_PROD && member.isAdmin === false) {
    if (env.memberIds.indexOf(member.memberId) < 0) {
      return Result.fail({
        code: 'BACKEND_MEMBER_DOES_NOT_HAVE_ACCESS_TO_ENV'
      });
    }
  }

  return Result.succeed(env);
}
