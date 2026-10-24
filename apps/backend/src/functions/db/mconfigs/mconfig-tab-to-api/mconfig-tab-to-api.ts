import type { MconfigTab } from '#backend/drizzle/postgres/schema/_tabs';
import { makeMconfigFields } from '#backend/functions/db/mconfigs/mconfig-tab-to-api/make-mconfig-fields/make-mconfig-fields';
import { makeMconfigFiltersX } from '#backend/functions/db/mconfigs/mconfig-tab-to-api/make-mconfig-filters-x/make-mconfig-filters-x';
import type { MconfigX } from '#common/types/backend/parts/mconfig/mconfig-x';
import type { ModelField } from '#common/types/blockml/parts/model/model-field';

export function mconfigTabToApi(item: {
  mconfig: MconfigTab;
  modelFields: ModelField[];
}): MconfigX {
  let { mconfig, modelFields } = item;

  let mconfigX: MconfigX = {
    structId: mconfig.structId,
    mconfigId: mconfig.mconfigId,
    queryId: mconfig.queryId,
    modelId: mconfig.modelId,
    modelType: mconfig.modelType,
    parentType: mconfig.parentType,
    parentId: mconfig.parentId,
    dateRangeIncludesRightSide: mconfig.dateRangeIncludesRightSide,
    storePart: mconfig.storePart,
    modelLabel: mconfig.modelLabel,
    modelFilePath: mconfig.modelFilePath,
    malloyQueryStable: mconfig.malloyQueryStable,
    malloyQueryExtra: mconfig.malloyQueryExtra,
    compiledQuery: mconfig.compiledQuery,
    select: mconfig.select,
    fields: makeMconfigFields({
      modelFields: modelFields,
      select: mconfig.select,
      sortings: mconfig.sortings,
      chart: mconfig.chart
    }),
    extendedFilters: makeMconfigFiltersX({
      modelFields: modelFields,
      mconfigFilters: mconfig.filters
    }),
    sortings: mconfig.sortings,
    sorts: mconfig.sorts,
    timezone: mconfig.timezone,
    limit: mconfig.limit,
    filters: mconfig.filters,
    appliedGivens: mconfig.appliedGivens,
    chart: mconfig.chart,
    serverTs: mconfig.serverTs
  };

  return mconfigX;
}
