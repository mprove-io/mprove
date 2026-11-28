import type { ModelX } from '#common/types/backend/parts/model/model-x';
import { matchSearchItems } from './match-search-items';

export function matchModels(item: {
  models: ModelX[];
  word: string;
}): ModelX[] {
  let { models, word } = item;

  let matches: ModelX[] = matchSearchItems({
    items: models,
    getSearchText: model => {
      let roles: string = model.accessRolesCombined
        .map(role => role.role)
        .join(' ');

      return `${model.label} ${model.modelId} ${model.connectionId} ${model.spaceFullTitle} ${roles}`;
    },
    word: word
  });

  return matches;
}
