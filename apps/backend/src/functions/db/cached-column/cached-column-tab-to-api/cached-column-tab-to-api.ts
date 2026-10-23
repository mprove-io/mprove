import type { CachedColumnTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { CachedColumn } from '#common/types/backend/parts/connections/cached-column';

export function cachedColumnTabToApi(item: {
  cachedColumn: CachedColumnTab;
}): CachedColumn {
  let { cachedColumn } = item;

  let apiCachedColumn: CachedColumn = {
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

  return apiCachedColumn;
}
