import { Result } from '@praha/byethrow';
import { getApiEnvs } from '#backend/functions/db/envs/get-api-envs/get-api-envs';
import type { DbService } from '#backend/services/db/db.service';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import type { GetCacheEnvIdError } from '#common/types/backend/function-errors/get-cache-env-id-error';

export async function getCacheEnvId(item: {
  db: DbService;
  projectId: string;
  envId: string;
}): Result.ResultAsync<string, GetCacheEnvIdError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('apiEnvs', v =>
      getApiEnvs({ db: v.db, projectId: v.projectId })
    ),
    Result.map((v): string =>
      v.apiEnvs.find(apiEnv => apiEnv.envId === v.envId)?.useProdCache === true
        ? PROJECT_ENV_PROD
        : v.envId
    )
  );
}
