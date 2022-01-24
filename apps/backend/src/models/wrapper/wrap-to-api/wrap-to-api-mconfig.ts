import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { makeMconfigFields } from '~backend/functions/make-mconfig-fields';
import { makeMconfigFiltersX } from '~backend/functions/make-mconfig-filters-x';

export function wrapToApiMconfig(item: {
  mconfig: entities.MconfigEntity;
  modelFields: common.ModelField[];
}): common.MconfigX {
  let { mconfig, modelFields } = item;

  return {
    structId: mconfig.struct_id,
    mconfigId: mconfig.mconfig_id,
    queryId: mconfig.query_id,
    modelId: mconfig.model_id,
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
    listen: mconfig.listen,
    filters: mconfig.filters,
    chart: mconfig.chart,
    temp: common.enumToBoolean(mconfig.temp),
    serverTs: Number(mconfig.server_ts)
  };
}
