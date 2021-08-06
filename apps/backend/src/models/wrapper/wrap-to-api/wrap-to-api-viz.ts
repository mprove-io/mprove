import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiViz(x: entities.VizEntity): common.Viz {
  return {
    structId: x.struct_id,
    vizId: x.viz_id,
    title: x.title,
    filePath: x.file_path,
    accessUsers: x.access_users,
    accessRoles: x.access_roles,
    gr: x.gr,
    hidden: common.enumToBoolean(x.hidden),
    reports: x.reports,
    serverTs: Number(x.server_ts)
  };
}
