import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { CatalogSearchField } from '#common/types/backend/parts/catalog-search-field';
import { matchSearchItems } from './match-search-items';

export type CatalogItemMatch<T> = {
  item: T;
  matchedFieldLabels?: string[];
};

type FieldCandidate<T> = {
  item: T;
  field: CatalogSearchField;
};

export function matchCatalogItems<T>(item: {
  items: T[];
  getSearchText: (item: T) => string;
  getFields: (item: T) => CatalogSearchField[] | undefined;
  word: string;
}): CatalogItemMatch<T>[] {
  let { items, getSearchText, getFields, word } = item;

  let directMatches: T[] = matchSearchItems({
    items: items,
    getSearchText: getSearchText,
    word: word
  });

  let itemWithFieldsSet = new Set<T>();

  let fieldCandidates: FieldCandidate<T>[] = items.flatMap(owner => {
    let fields: CatalogSearchField[] = getFields(owner);

    if (isUndefined(fields)) {
      return [];
    }

    itemWithFieldsSet.add(owner);

    return fields.map(field => ({ item: owner, field: field }));
  });

  let fieldMatches: FieldCandidate<T>[] =
    fieldCandidates.length === 0
      ? []
      : matchSearchItems({
          items: fieldCandidates,
          getSearchText: candidate =>
            `${candidate.field.label} ${candidate.field.id}`,
          word: word
        });

  let labelsByItem = new Map<T, Set<string>>();

  let searchWord: string = word.toLowerCase();

  fieldMatches.forEach(({ item: owner, field }) => {
    let label: string = field.label || field.id;

    if (
      label.toLowerCase().indexOf(searchWord) < 0 &&
      field.id.toLowerCase().includes(searchWord)
    ) {
      label = `${label} (${field.id})`;
    }

    let labels: Set<string> = labelsByItem.get(owner) ?? new Set<string>();

    labels.add(label);

    labelsByItem.set(owner, labels);
  });

  let matchingItems = new Set([...directMatches, ...labelsByItem.keys()]);

  let matches: CatalogItemMatch<T>[] = [...matchingItems].map(owner => ({
    item: owner,
    matchedFieldLabels: itemWithFieldsSet.has(owner)
      ? [...(labelsByItem.get(owner) ?? [])]
      : undefined
  }));

  return matches;
}
