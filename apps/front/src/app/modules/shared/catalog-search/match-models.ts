import type { ModelX } from '#common/types/backend/parts/model/model-x';
import {
  type CatalogItemMatch,
  matchCatalogItems
} from './match-catalog-items';

export function matchModels(item: {
  models: ModelX[];
  word: string;
}): CatalogItemMatch<ModelX>[] {
  let { models, word } = item;

  let matches: CatalogItemMatch<ModelX>[] = matchCatalogItems({
    items: models,
    getSearchText: model => {
      let roles: string = model.accessRolesCombined
        .map(role => role.role)
        .join(' ');

      return `${model.label} ${model.modelId} ${model.connectionId} ${model.spaceFullTitle} ${roles}`;
    },
    getFields: model => (model.fields ?? []).filter(field => !field.hidden),
    word: word
  });

  return matches;
}
