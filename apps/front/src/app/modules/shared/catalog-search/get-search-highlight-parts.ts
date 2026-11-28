export type SearchHighlightPart = {
  text: string;
  isMatch: boolean;
};

export function getSearchHighlightParts(item: {
  text: string;
  word: string;
  isFieldMatch?: boolean;
}): SearchHighlightPart[] {
  let { text, word, isFieldMatch } = item;

  let escapedWord: string = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  let pattern = new RegExp(escapedWord, 'gi');

  let matches: RegExpMatchArray[] =
    word.length === 0 ? [] : [...text.matchAll(pattern)];

  if (matches.length === 0) {
    return [{ text: text, isMatch: isFieldMatch === true }];
  }

  let parts: SearchHighlightPart[] = [];

  let offset = 0;

  matches.forEach(match => {
    if (offset < match.index) {
      parts.push({ text: text.slice(offset, match.index), isMatch: false });
    }

    parts.push({ text: match[0], isMatch: true });

    offset = match.index + match[0].length;
  });

  if (offset < text.length) {
    parts.push({ text: text.slice(offset), isMatch: false });
  }

  return parts;
}
