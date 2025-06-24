import { KeyValuePair } from '~common/interfaces/blockml/key-value-pair';

interface ParseResult {
  malloyTags: KeyValuePair[];
  mproveTags: KeyValuePair[];
  malloyFlags: string[];
  mproveFlags: string[];
}

export function parseTagsAndFlags(item: {
  inputs: string[];
}): ParseResult {
  let { inputs } = item;

  let mproveTags: KeyValuePair[] = [];
  let mproveFlags: string[] = [];
  let malloyTags: KeyValuePair[] = [];
  let malloyFlags: string[] = [];

  inputs.forEach(input => {
    let mproveMatch = input.match(/#\(mprove\)\s/);
    let malloyMatch = input.match(/#\s/);

    if (mproveMatch) {
      let content = input
        .slice(mproveMatch.index + mproveMatch[0].length)
        .trim();
      let tokens = content.split(/\s+/);

      tokens.forEach(token => {
        let pairMatch = token.match(/(\w+)=(?:"([^"]*)"|(\S+))/);

        if (pairMatch) {
          let key = pairMatch[1];
          let value = pairMatch[2] !== undefined ? pairMatch[2] : pairMatch[3];
          mproveTags.push({ key, value });
        } else {
          let flagMatch = token.match(/^\w+$/);
          if (flagMatch) {
            mproveFlags.push(token);
          }
        }
      });
    } else if (malloyMatch) {
      let tokens = input.trim().split(/\s+/);

      tokens.forEach(token => {
        let pairMatch = token.match(/(\w+)=(?:"([^"]*)"|(\S+))/);
        if (pairMatch) {
          let key = pairMatch[1];
          let value = pairMatch[2] !== undefined ? pairMatch[2] : pairMatch[3];
          malloyTags.push({ key, value });
        } else {
          let flagMatch = token.match(/^\w+$/);
          if (flagMatch) {
            malloyFlags.push(token);
          }
        }
      });
    }
  });

  return { mproveTags, mproveFlags, malloyTags, malloyFlags };
}
