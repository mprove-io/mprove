import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';

export function wrapToApiModel(item: {
  model: schemaPostgres.ModelEnt;
  hasAccess: boolean;
}): common.ModelX {
  let { model, hasAccess } = item;

  return {
    structId: model.structId,
    modelId: model.modelId,
    hasAccess: hasAccess,
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
