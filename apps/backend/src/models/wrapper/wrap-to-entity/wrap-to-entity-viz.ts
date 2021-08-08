import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToEntityViz(x: common.Viz): entities.VizEntity {
  return {
    struct_id: x.structId,
    viz_id: x.vizId,
    title: x.title,
    model_id: x.modelId,
    model_label: x.modelLabel,
    file_path: x.filePath,
    access_users: x.accessUsers,
    access_roles: x.accessRoles,
    gr: x.gr,
    hidden: common.booleanToEnum(x.hidden),
    reports: x.reports,
    server_ts: x.serverTs.toString()
  };
}
