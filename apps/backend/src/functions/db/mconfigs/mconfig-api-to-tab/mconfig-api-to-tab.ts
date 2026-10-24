import type { MconfigTab } from '#backend/drizzle/postgres/schema/_tabs';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Mconfig } from '#common/types/blockml/parts/mconfig/mconfig';

export function mconfigApiToTab(item: { apiMconfig: Mconfig }): MconfigTab {
  let { apiMconfig } = item;

  if (isUndefined(apiMconfig)) {
    return;
  }

  let mconfig: MconfigTab = {
    structId: apiMconfig.structId,
    queryId: apiMconfig.queryId,
    mconfigId: apiMconfig.mconfigId,
    modelId: apiMconfig.modelId,
    modelType: apiMconfig.modelType,
    parentType: apiMconfig.parentType,
    parentId: apiMconfig.parentId,
    dateRangeIncludesRightSide: apiMconfig.dateRangeIncludesRightSide,
    storePart: apiMconfig.storePart,
    modelLabel: apiMconfig.modelLabel,
    modelFilePath: apiMconfig.modelFilePath,
    malloyQueryStable: apiMconfig.malloyQueryStable,
    malloyQueryExtra: apiMconfig.malloyQueryExtra,
    compiledQuery: apiMconfig.compiledQuery,
    select: apiMconfig.select,
    sortings: apiMconfig.sortings,
    sorts: apiMconfig.sorts,
    timezone: apiMconfig.timezone,
    limit: apiMconfig.limit,
    filters: apiMconfig.filters,
    appliedGivens: apiMconfig.appliedGivens,
    chart: apiMconfig.chart,
    sessionId: undefined,
    keyTag: undefined,
    serverTs: apiMconfig.serverTs
  };

  return mconfig;
}
