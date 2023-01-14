import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiRep(item: { rep: entities.RepEntity }): common.Rep {
  let { rep } = item;

  return {
    structId: rep.struct_id,
    repId: rep.rep_id,
    filePath: rep.file_path,
    title: rep.title,
    timezone: rep.timezone,
    timeSpec: rep.time_spec,
    timeRange: rep.time_range,
    rows: rep.rows,
    serverTs: Number(rep.server_ts)
  };
}
