import { Result } from '@praha/byethrow';
import type {
  CachedColumnsEnt,
  CachedColumnTab
} from '#backend/drizzle/postgres/tables/cached-columns';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import { makeCachedColumnFullId } from '#backend/functions/hash/make-cached-column-full-id/make-cached-column-full-id';
import type { TabService } from '#backend/services/tab/tab.service';
import type { CachedColumnLt } from '#common/types/shared/st-lt/cached-columns/cached-column-lt';
import type { CachedColumnSt } from '#common/types/shared/st-lt/cached-columns/cached-column-st';

export function cachedColumnTabToEnt(item: {
  tab: CachedColumnTab;

  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<CachedColumnsEnt, never> {
  let { tab, tabService, isEncryptDb, isEncryptMetadata } = item;

  let cachedColumnSt: CachedColumnSt = {};
  let cachedColumnLt: CachedColumnLt = {};

  let cachedColumnEnt: CachedColumnsEnt = {
    cachedColumnFullId: makeCachedColumnFullId({
      projectId: tab.projectId,
      connectionId: tab.connectionId,
      envId: tab.envId,
      schemaName: tab.schemaNameLc,
      tableName: tab.tableNameLc,
      columnName: tab.columnNameLc
    }),
    projectId: tab.projectId,
    connectionId: tab.connectionId,
    envId: tab.envId,
    schemaNameLc: tab.schemaNameLc,
    tableNameLc: tab.tableNameLc,
    columnNameLc: tab.columnNameLc,
    requestedByUserId: tab.requestedByUserId,
    status: tab.status,
    errorMessage: tab.errorMessage,
    startedTs: tab.startedTs,
    completedTs: tab.completedTs,
    completedDurationMs: tab.completedDurationMs,
    limit: tab.limit,
    sampleSize: tab.sampleSize,
    isLimitReached: tab.isLimitReached,
    uniqueValuesCount: tab.uniqueValuesCount,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: cachedColumnSt,
      dataLt: cachedColumnLt,
      isMetadata: false,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(cachedColumnEnt);
}
