import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { helper } from '../../../barrels/helper';

export function wrapToApiModel(model: entities.ModelEntity): api.Model {
  return {
    model_id: model.model_id,
    project_id: model.project_id,
    repo_id: model.repo_id,
    struct_id: model.struct_id,
    content: model.content,
    access_users: JSON.parse(model.access_users),
    label: model.label,
    gr: model.gr,
    hidden: helper.benumToBoolean(model.hidden),
    fields: JSON.parse(model.fields),
    nodes: JSON.parse(model.nodes),
    description: model.description,
    server_ts: Number(model.server_ts)
  };
}
