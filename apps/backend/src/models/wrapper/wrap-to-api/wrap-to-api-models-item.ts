import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiModelsItem(
  model: entities.ModelEntity
): common.ModelsItem {
  return {
    modelId: model.model_id,
    filePath: model.file_path,
    label: model.label,
    gr: model.gr,
    hidden: common.enumToBoolean(model.hidden)
  };
}
