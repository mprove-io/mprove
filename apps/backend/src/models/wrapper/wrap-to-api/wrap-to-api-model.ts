import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiModel(x: entities.ModelEntity): common.Model {
  return {
    structId: x.struct_id,
    modelId: x.model_id,
    connectionId: x.connection_id,
    filePath: x.file_path,
    content: x.content,
    accessUsers: x.access_users,
    accessRoles: x.access_roles,
    label: x.label,
    gr: x.gr,
    hidden: common.enumToBoolean(x.hidden),
    fields: x.fields,
    nodes: x.nodes,
    description: x.description,
    serverTs: Number(x.server_ts)
  };
}
