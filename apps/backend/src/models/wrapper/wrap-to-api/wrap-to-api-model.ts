import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiModel(item: {
  model: entities.ModelEntity;
  hasAccess: boolean;
}): common.ModelX {
  let { model, hasAccess } = item;

  return {
    structId: model.struct_id,
    modelId: model.model_id,
    hasAccess: hasAccess,
    connectionId: model.connection_id,
    filePath: model.file_path,
    content: model.content,
    accessUsers: model.access_users,
    accessRoles: model.access_roles,
    label: model.label,
    gr: model.gr,
    hidden: common.enumToBoolean(model.hidden),
    fields: model.fields,
    nodes: model.nodes,
    description: model.description,
    serverTs: Number(model.server_ts)
  };
}
