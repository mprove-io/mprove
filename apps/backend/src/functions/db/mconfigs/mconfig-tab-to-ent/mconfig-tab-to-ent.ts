import { Result } from '@praha/byethrow';
import type { MconfigTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { MconfigEnt } from '#backend/drizzle/postgres/schema/mconfigs';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { TabService } from '#backend/services/tab/tab.service';
import type { MconfigLt } from '#common/types/shared/st-lt/mconfigs/mconfig-lt';
import type { MconfigSt } from '#common/types/shared/st-lt/mconfigs/mconfig-st';

export function mconfigTabToEnt(item: {
  tab: MconfigTab;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<MconfigEnt, never> {
  let { tab, tabService, isEncryptDb, isEncryptMetadata } = item;

  let mconfigSt: MconfigSt = {};

  let mconfigLt: MconfigLt = {
    dateRangeIncludesRightSide: tab.dateRangeIncludesRightSide,
    storePart: tab.storePart,
    modelLabel: tab.modelLabel,
    modelFilePath: tab.modelFilePath,
    malloyQueryStable: tab.malloyQueryStable,
    malloyQueryExtra: tab.malloyQueryExtra,
    compiledQuery: tab.compiledQuery,
    select: tab.select,
    sortings: tab.sortings,
    sorts: tab.sorts,
    timezone: tab.timezone,
    limit: tab.limit,
    filters: tab.filters,
    appliedGivens: tab.appliedGivens,
    chart: tab.chart
  };

  let mconfigEnt: MconfigEnt = {
    mconfigId: tab.mconfigId,
    structId: tab.structId,
    queryId: tab.queryId,
    modelId: tab.modelId,
    modelType: tab.modelType,
    parentType: tab.parentType,
    parentId: tab.parentId,
    sessionId: tab.sessionId,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: mconfigSt,
      dataLt: mconfigLt,
      isMetadata: true,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(mconfigEnt);
}
