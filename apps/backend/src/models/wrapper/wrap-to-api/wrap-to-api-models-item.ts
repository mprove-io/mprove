import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiModelsItem(
  model: entities.ModelEntity
): common.ModelsItem {
  return {
    modelId: model.model_id,
    label: model.label,
    gr: model.gr,
    hidden: common.enumToBoolean(model.hidden)
  };
}
