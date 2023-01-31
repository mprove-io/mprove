import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToEntityRep(x: common.Rep): entities.RepEntity {
  return {
    project_id: x.projectId,
    struct_id: x.structId,
    rep_id: x.repId,
    file_path: x.filePath,
    draft: common.booleanToEnum(x.draft),
    creator_id: x.creatorId,
    access_users: x.accessUsers,
    access_roles: x.accessRoles,
    title: x.title,
    rows: x.rows,
    server_ts: x.serverTs.toString()
  };
}
