import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { helper } from '../../../barrels/helper';

export function wrapToEntityModel(model: api.Model): entities.ModelEntity {

  return {
    model_id: helper.undefinedToNull(model.model_id),
    project_id: helper.undefinedToNull(model.project_id),
    repo_id: helper.undefinedToNull(model.repo_id),
    struct_id: helper.undefinedToNull(model.struct_id),
    content: helper.undefinedToNull(model.content),
    access_users: model.access_users ? JSON.stringify(model.access_users) : null,
    label: helper.undefinedToNull(model.label),
    gr: helper.undefinedToNull(model.gr),
    hidden: helper.booleanToBenum(model.hidden),
    fields: model.fields ? JSON.stringify(model.fields) : null,
    nodes: model.nodes ? JSON.stringify(model.nodes) : null,
    description: helper.undefinedToNull(model.description),
    server_ts: model.server_ts ? model.server_ts.toString() : null,
  };
}
