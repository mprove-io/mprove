import { common } from '~backend/barrels/common';

export function wrapToApiModelsItem(item: {
  model: common.Model;
  hasAccess: boolean;
}): common.ModelsItem {
  let { model, hasAccess } = item;

  let modelsItem: common.ModelsItem = Object.assign({}, model, <
    common.ModelsItem
  >{ hasAccess: hasAccess });

  return modelsItem;
}
