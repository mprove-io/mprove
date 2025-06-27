import { KeyValuePair } from '~common/interfaces/blockml/key-value-pair';

interface ParseResult {
  malloyTags: KeyValuePair[];
  mproveTags: KeyValuePair[];
}

export function parseTags(item: { inputs: string[] }): ParseResult {
  let { inputs } = item;

  let mproveTags: KeyValuePair[] = [];
  let mproveFlags: string[] = [];
  let malloyTags: KeyValuePair[] = [];
  let malloyFlags: string[] = [];

  let tokenRegex = /(\w+)=("([^"]*)"|\S+)|(\w+)/g;

  let processMatches = (
    content: string,
    targetTags: KeyValuePair[],
    targetFlags: string[]
  ) => {
    let matches = content.matchAll(tokenRegex);
    for (let match of matches) {
      if (match[1]) {
        let key = match[1];
        let value = match[3] !== undefined ? match[3] : match[2];
        targetTags.push({ key, value });
      } else if (match[4]) {
        targetFlags.push(match[4]);
      }
    }
  };

  inputs.forEach(input => {
    // input = input.replace(/\s+/g, ' ').trim();

    let tagTypes = [
      { regex: /#\(mprove\)\s/, tags: mproveTags, flags: mproveFlags },
      { regex: /#\s/, tags: malloyTags, flags: malloyFlags }
    ];

    tagTypes.forEach(x => {
      let match = input.match(x.regex);
      if (match) {
        let content = input.slice(match.index + match[0].length).trim();
        processMatches(content, x.tags, x.flags);
      }
    });
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
