import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToEntityMconfig(x: common.Mconfig): entities.MconfigEntity {
  return {
    struct_id: x.structId,
    query_id: x.queryId,
    mconfig_id: x.mconfigId,
    model_id: x.modelId,
    model_label: x.modelLabel,
    select: x.select,
    sortings: x.sortings,
    sorts: x.sorts,
    timezone: x.timezone,
    limit: x.limit,
    filters: x.filters,
    chart: x.chart,
    temp: common.booleanToEnum(x.temp),
    server_ts: x.serverTs.toString()
  };
}
