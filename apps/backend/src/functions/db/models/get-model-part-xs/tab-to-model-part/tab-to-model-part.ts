import type { ModelTab } from '#backend/drizzle/postgres/tables/models';
import type { ModelPart } from '#common/types/backend/parts/model/model-part';

export function tabToModelPart(item: { model: ModelTab }): ModelPart {
  let { model } = item;

  let modelPart: ModelPart = {
    structId: model.structId,
    modelId: model.modelId,
    accessRoles: model.accessRoles,
    accessRolesCombined: model.accessRolesCombined
  };

  return modelPart;
}
