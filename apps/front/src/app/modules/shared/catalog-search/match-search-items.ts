import uFuzzy from '@leeoniya/ufuzzy';

export function matchSearchItems<T>(item: {
  items: T[];
  getSearchText: (item: T) => string;
  word: string;
}): T[] {
  let { items, getSearchText, word } = item;

  let haystack: string[] = items.map(getSearchText);

  let matcher = new uFuzzy({});

  let matchedIndexes = new Set<number>(matcher.filter(haystack, word) ?? []);

  let searchWord: string = word.toLowerCase();

  haystack.forEach((searchText, index) => {
    if (searchText.toLowerCase().includes(searchWord)) {
      matchedIndexes.add(index);
    }
  });

  let matches: T[] = Array.from(matchedIndexes, index => items[index]);

  return matches;
}
