import { Result } from '@praha/byethrow';
import type {
  CachedPartsEnt,
  CachedPartTab
} from '#backend/drizzle/postgres/tables/cached-parts';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import { makeCachedPartFullId } from '#backend/functions/hash/make-cached-part-full-id/make-cached-part-full-id';
import type { TabService } from '#backend/services/tab/tab.service';
import type { CachedPartLt } from '#common/types/shared/st-lt/cached-parts/cached-part-lt';
import type { CachedPartSt } from '#common/types/shared/st-lt/cached-parts/cached-part-st';

export function cachedPartTabToEnt(item: {
  tab: CachedPartTab;

  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<CachedPartsEnt, never> {
  let { tab, tabService, isEncryptDb, isEncryptMetadata } = item;

  let cachedPartSt: CachedPartSt = {};
  let cachedPartLt: CachedPartLt = {};

  let cachedPartEnt: CachedPartsEnt = {
    cachedPartFullId: makeCachedPartFullId({
      projectId: tab.projectId,
      connectionId: tab.connectionId,
      envId: tab.envId,
      schemaName: tab.schemaNameLc,
      tableName: tab.tableNameLc,
      columnName: tab.columnNameLc,
      columnValue: tab.columnValue
    }),
    projectId: tab.projectId,
    connectionId: tab.connectionId,
    envId: tab.envId,
    schemaNameLc: tab.schemaNameLc,
    tableNameLc: tab.tableNameLc,
    columnNameLc: tab.columnNameLc,
    columnValue: tab.columnValue,
    columnValueLc: tab.columnValueLc,
    count: tab.count,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: cachedPartSt,
      dataLt: cachedPartLt,
      isMetadata: false,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(cachedPartEnt);
}
