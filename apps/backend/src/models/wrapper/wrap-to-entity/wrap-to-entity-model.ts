import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';

export function wrapToEntityModel(item: {
  model: common.Model;
  modelFullId?: string;
}): schemaPostgres.ModelEnt {
  let { model, modelFullId } = item;

  return {
    modelFullId: modelFullId || common.makeId(),
    structId: model.structId,
    modelId: model.modelId,
    connectionId: model.connectionId,
    filePath: model.filePath,
    content: model.content,
    accessUsers: model.accessUsers,
    accessRoles: model.accessRoles,
    label: model.label,
    gr: model.gr,
    hidden: model.hidden,
    fields: model.fields,
    nodes: model.nodes,
    description: model.description,
    serverTs: model.serverTs
  };
}
