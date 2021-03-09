import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiMconfig(x: entities.MconfigEntity): common.Mconfig {
  return {
    structId: x.struct_id,
    mconfigId: x.mconfig_id,
    queryId: x.query_id,
    modelId: x.model_id,
    select: x.select,
    sortings: x.sortings,
    sorts: x.sorts,
    timezone: x.timezone,
    limit: x.limit,
    filters: x.filters,
    charts: x.charts,
    temp: common.enumToBoolean(x.temp),
    serverTs: Number(x.server_ts)
  };
}
