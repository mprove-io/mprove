import { Injectable } from '@nestjs/common';
import type { CachedColumnTab } from '#backend/drizzle/postgres/schema/_tabs';
import { EnvsService } from '#backend/services/db/envs.service';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import type { CachedColumn } from '#common/zod/to-backend/connections/cached-column';

@Injectable()
export class CachedColumnService {
  constructor(private envsService: EnvsService) {}

  async getCacheEnvId(item: { projectId: string; envId: string }) {
    let { projectId, envId } = item;

    let apiEnvs = await this.envsService.getApiEnvs({ projectId: projectId });

    let apiEnv = apiEnvs.find(x => x.envId === envId);

    return apiEnv?.useProdCache === true ? PROJECT_ENV_PROD : envId;
  }

  cachedColumnTabToApi(item: { cachedColumn: CachedColumnTab }): CachedColumn {
    let { cachedColumn } = item;

    return {
      projectId: cachedColumn.projectId,
      connectionId: cachedColumn.connectionId,
      envId: cachedColumn.envId,
      schemaName: cachedColumn.schemaName,
      tableName: cachedColumn.tableName,
      columnName: cachedColumn.columnName,
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
