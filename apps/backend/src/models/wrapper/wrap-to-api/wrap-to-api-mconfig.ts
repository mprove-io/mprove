import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { makeMconfigFields } from '~backend/functions/make-mconfig-fields';
import { makeMconfigFiltersX } from '~backend/functions/make-mconfig-filters-x';

export function wrapToApiMconfig(item: {
  mconfig: schemaPostgres.MconfigEnt;
  modelFields: common.ModelField[];
}): common.MconfigX {
  let { mconfig, modelFields } = item;

  return {
    structId: mconfig.structId,
    mconfigId: mconfig.mconfigId,
    queryId: mconfig.queryId,
    modelId: mconfig.modelId,
    modelLabel: mconfig.modelLabel,
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
    chart: mconfig.chart,
    temp: mconfig.temp,
    serverTs: mconfig.serverTs
  };
}
