import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToEntityModel(x: common.Model): entities.ModelEntity {
  return {
    struct_id: x.structId,
    model_id: x.modelId,
    content: x.content,
    access_users: x.accessUsers,
    access_roles: x.accessRoles,
    label: x.label,
    gr: x.gr,
    hidden: common.booleanToBoolEnum(x.hidden),
    fields: x.fields,
    nodes: x.nodes,
    description: x.description,
    server_ts: x.serverTs.toString()
  };
}
