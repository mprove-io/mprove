import type { ModelTab } from '#backend/drizzle/postgres/schema/_tabs';
import { makeModelFullId } from '#backend/functions/hash/make-model-full-id/make-model-full-id';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Model } from '#common/types/blockml/parts/model/model';

export function modelApiToTab(item: { apiModel: Model }): ModelTab {
  let { apiModel } = item;

  if (isUndefined(apiModel)) {
    return;
  }

  let model: ModelTab = {
    modelFullId: makeModelFullId({
      structId: apiModel.structId,
      modelId: apiModel.modelId
    }),
    structId: apiModel.structId,
    modelId: apiModel.modelId,
    type: apiModel.type,
    connectionId: apiModel.connectionId,
    connectionType: apiModel.connectionType,
    accessRoles: apiModel.accessRoles,
    accessRolesCombined: apiModel.accessRolesCombined,
    source: apiModel.source,
    malloyModelDef: apiModel.malloyModelDef,
    filePath: apiModel.filePath,
    space: apiModel.space,
    spaceFullTitle: apiModel.spaceFullTitle,
    fileText: apiModel.fileText,
    storeContent: apiModel.storeContent,
    dateRangeIncludesRightSide: apiModel.dateRangeIncludesRightSide,
    label: apiModel.label,
    fields: apiModel.fields,
    nodes: apiModel.nodes,
    keyTag: undefined,
    serverTs: apiModel.serverTs
  };

  return model;
}
