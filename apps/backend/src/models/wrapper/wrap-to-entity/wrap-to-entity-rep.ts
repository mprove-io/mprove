import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToEntityRep(x: common.Rep): entities.RepEntity {
  return {
    struct_id: x.structId,
    rep_id: x.repId,
    file_path: x.filePath,
    title: x.title,
    timezone: x.timezone,
    time_spec: x.timeSpec,
    time_range: x.timeRange,
    rows: x.rows,
    server_ts: x.serverTs.toString()
  };
}
