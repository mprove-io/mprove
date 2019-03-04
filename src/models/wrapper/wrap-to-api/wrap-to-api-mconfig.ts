import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { helper } from '../../../barrels/helper';

export function wrapToApiMconfig(mconfig: entities.MconfigEntity): api.Mconfig {

  return {
    mconfig_id: mconfig.mconfig_id,
    query_id: mconfig.query_id,
    project_id: mconfig.project_id,
    repo_id: mconfig.repo_id,
    struct_id: mconfig.struct_id,
    model_id: mconfig.model_id,
    select: JSON.parse(mconfig.select),
    sortings: JSON.parse(mconfig.sortings),
    sorts: mconfig.sorts,
    timezone: mconfig.timezone,
    limit:  mconfig.limit,
    filters: JSON.parse(mconfig.filters),
    charts: JSON.parse(mconfig.charts),
    temp: helper.benumToBoolean(mconfig.temp),
    server_ts: Number(mconfig.server_ts),
  };
}
