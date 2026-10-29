import type { ModelTab } from '#backend/drizzle/postgres/tables/models';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ModelX } from '#common/types/backend/parts/model/model-x';

export function modelTabToApi(item: {
  model: ModelTab;
  hasAccess: boolean;
}): ModelX {
  let { model, hasAccess } = item;

  let timeframeBaseFieldIds: string[];

  let fields;

  let nodes;

  if (isDefined(model.fields)) {
    timeframeBaseFieldIds = model.fields
      .filter(field => field.isTimeframeBase === true)
      .map(field => field.id);

    fields = model.fields.filter(field => field.isTimeframeBase === false);
  }

  if (isDefined(model.nodes)) {
    nodes = model.nodes.map(node => {
      node.children?.map(midNode => {
        if (midNode.children) {
          midNode.children = midNode.children?.filter(child => {
            return (
              child.isField === false ||
              timeframeBaseFieldIds.indexOf(child.id) < 0
            );
          });
        }

        return midNode;
      });

      return node;
    });
  }

  let apiModel: ModelX = {
    structId: model.structId,
    modelId: model.modelId,
    type: model.type,
    source: model.source,
    malloyModelDef: model.malloyModelDef,
    hasAccess: hasAccess,
    connectionId: model.connectionId,
    connectionType: model.connectionType,
    filePath: model.filePath,
    space: model.space,
    fileText: model.fileText,
    storeContent: model.storeContent,
    dateRangeIncludesRightSide: model.dateRangeIncludesRightSide,
    accessRoles: model.accessRoles,
    accessRolesCombined: model.accessRolesCombined,
    spaceFullTitle: model.spaceFullTitle,
    label: model.label,
    fields: fields,
    nodes: nodes,
    serverTs: model.serverTs
  };

  return apiModel;
}
