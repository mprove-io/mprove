import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import type { CachedColumnTab } from '#backend/drizzle/postgres/schema/_tabs';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import type { GetApiEnvsResultError } from '#common/types/backend/function-errors/get-api-envs-result-error';
import type { GetCacheEnvIdResultError } from '#common/types/backend/function-errors/get-cache-env-id-result-error';
import type { CachedColumn } from '#common/types/backend/parts/connections/cached-column';
import type { Env } from '#common/types/backend/parts/env';

@Injectable()
export class CachedColumnService {
  constructor(private envsService: EnvsService) {}

  async getCacheEnvId(item: {
    projectId: string;
    envId: string;
  }): Promise<string> {
    let { projectId, envId } = item;

    let result: Result.Result<string, GetCacheEnvIdResultError> =
      await this.getCacheEnvIdResult({ projectId: projectId, envId: envId });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let cacheEnvId: string = result.value;

    return cacheEnvId;
  }

  async getCacheEnvIdResult(item: {
    projectId: string;
    envId: string;
  }): Result.ResultAsync<string, GetCacheEnvIdResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'apiEnvs',
        (v): Result.ResultAsync<Env[], GetApiEnvsResultError> =>
          this.envsService.getApiEnvsResult({ projectId: v.projectId })
      ),
      Result.map((v): string =>
        v.apiEnvs.find(apiEnv => apiEnv.envId === v.envId)?.useProdCache ===
        true
          ? PROJECT_ENV_PROD
          : v.envId
      )
    );
  }

  cachedColumnTabToApi(item: { cachedColumn: CachedColumnTab }): CachedColumn {
    let { cachedColumn } = item;

    return {
      projectId: cachedColumn.projectId,
      connectionId: cachedColumn.connectionId,
      envId: cachedColumn.envId,
      schemaName: cachedColumn.schemaNameLc,
      tableName: cachedColumn.tableNameLc,
      columnName: cachedColumn.columnNameLc,
      requestedByUserId: cachedColumn.requestedByUserId,
      status: cachedColumn.status,
      errorMessage: cachedColumn.errorMessage,
      startedTs: cachedColumn.startedTs,
      completedTs: cachedColumn.completedTs,
      completedDurationMs: cachedColumn.completedDurationMs,
      limit: cachedColumn.limit,
      sampleSize: cachedColumn.sampleSize,
      isLimitReached: cachedColumn.isLimitReached,
      serverTs: cachedColumn.serverTs,
      uniqueValuesCount: cachedColumn.uniqueValuesCount
    };
  }
}
