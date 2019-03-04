import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { helper } from '../../../barrels/helper';

export function wrapToEntityMconfig(mconfig: api.Mconfig): entities.MconfigEntity {

  return {
    mconfig_id: helper.undefinedToNull(mconfig.mconfig_id),
    query_id: helper.undefinedToNull(mconfig.query_id),
    project_id: helper.undefinedToNull(mconfig.project_id),
    repo_id: helper.undefinedToNull(mconfig.repo_id),
    struct_id: helper.undefinedToNull(mconfig.struct_id),
    model_id: helper.undefinedToNull(mconfig.model_id),
    select: mconfig.select ? JSON.stringify(mconfig.select) : null,
    sortings: mconfig.sortings ? JSON.stringify(mconfig.sortings) : null,
    sorts: helper.undefinedToNull(mconfig.sorts),
    timezone: helper.undefinedToNull(mconfig.timezone),
    limit: helper.undefinedToNull(mconfig.limit),
    filters: mconfig.filters ? JSON.stringify(mconfig.filters) : null,
    charts: mconfig.charts ? JSON.stringify(mconfig.charts) : null,
    temp: helper.booleanToBenum(mconfig.temp),
    server_ts: mconfig.server_ts ? mconfig.server_ts.toString() : null,
  };
}
