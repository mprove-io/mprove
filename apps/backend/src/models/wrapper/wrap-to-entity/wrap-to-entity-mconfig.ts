import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';

export function wrapToEntityMconfig(item: {
  mconfig: common.Mconfig;
}): schemaPostgres.MconfigEnt {
  let { mconfig } = item;

  return {
    structId: mconfig.structId,
    queryId: mconfig.queryId,
    mconfigId: mconfig.mconfigId,
    modelId: mconfig.modelId,
    modelLabel: mconfig.modelLabel,
    select: mconfig.select,
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
