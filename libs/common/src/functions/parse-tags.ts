import { KeyValuePair } from '~common/interfaces/blockml/key-value-pair';

interface ParseResult {
  malloyTags: KeyValuePair[];
  mproveTags: KeyValuePair[];
}

export function parseTags(item: {
  inputs: string[];
}): ParseResult {
  let { inputs } = item;

  let mproveTags: KeyValuePair[] = [];
  let mproveFlags: string[] = [];
  let malloyTags: KeyValuePair[] = [];
  let malloyFlags: string[] = [];

  // Regex to match key-value pairs (quoted or unquoted) and flags
  const tokenRegex = /(\w+)=(?:"([^"]*)"|\S+)|(\w+)/g;

  inputs.forEach(input => {
    let mproveMatch = input.match(/#\(mprove\)\s/);
    let malloyMatch = input.match(/#\s/);

    if (mproveMatch) {
      let content = input
        .slice(mproveMatch.index + mproveMatch[0].length)
        .trim();

      let matches = content.matchAll(tokenRegex);
      for (let match of matches) {
        if (match[1] && (match[2] !== undefined || match[3])) {
          // Key-value pair
          let key = match[1];
          let value = match[2] !== undefined ? match[2] : match[3];
          mproveTags.push({ key, value });
        } else if (match[3]) {
          // Flag
          mproveFlags.push(match[3]);
        }
      }
    } else if (malloyMatch) {
      let content = input
        .slice(malloyMatch.index + malloyMatch[0].length)
        .trim();

      let matches = content.matchAll(tokenRegex);
      for (let match of matches) {
        if (match[1] && (match[2] !== undefined || match[3])) {
          // Key-value pair
          let key = match[1];
          let value = match[2] !== undefined ? match[2] : match[3];
          malloyTags.push({ key, value });
        } else if (match[3]) {
          // Flag
          malloyFlags.push(match[3]);
        }
      }
    }
  });

  mproveFlags.forEach(mproveFlag =>
    mproveTags.push({ key: mproveFlag, value: undefined })
  );

  malloyFlags.forEach(malloyFlag =>
    malloyTags.push({ key: malloyFlag, value: undefined })
  );

  return {
    mproveTags,
    malloyTags
  };
}
