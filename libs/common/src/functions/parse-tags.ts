import { Tag, TagInterface } from '@malloydata/malloy-tag';
import { KeyTagPair } from '~common/interfaces/blockml/key-tag-pair';
import { KeyValuePair } from '~common/interfaces/blockml/key-value-pair';
import { isDefined } from './is-defined';
import { isUndefined } from './is-undefined';

interface ParseResult {
  malloyTags: KeyValuePair[];
  mproveTags: KeyValuePair[];
}

export function parseTags(item: {
  inputs: string[];
}): ParseResult {
  let { inputs } = item;

  let mproveFlags: string[] = [];
  let mproveSimpleTags: KeyValuePair[] = [];
  let mproveComplexTags: KeyTagPair[] = [];

  let malloyFlags: string[] = [];
  let malloySimpleTags: KeyValuePair[] = [];
  let malloyComplexTags: KeyTagPair[] = [];

  let tagTypes = [
    {
      prefix: '#(mprove) ',
      simpleTags: mproveSimpleTags,
      complexTags: mproveComplexTags,
      flags: mproveFlags
    },
    {
      prefix: '# ',
      simpleTags: malloySimpleTags,
      complexTags: malloyComplexTags,
      flags: malloyFlags
    }
  ];

  tagTypes.forEach(x => {
    let lines = inputs.filter(l => l.startsWith(x.prefix));

    if (lines.length > 0) {
      // console.log('lines');
      // console.log(lines);

      let t1: Tag = Tag.fromTagLines(lines).tag;

      // console.log('t');
      // console.log(t1);

      if (isDefined(t1?.properties)) {
        Object.keys(t1.properties).forEach(key1 => {
          let t2: TagInterface = t1.properties[key1];
          if (isUndefined(t2.properties) && isUndefined(t2.eq)) {
            x.flags.push(key1);
          } else if (isUndefined(t2.properties) && typeof t2.eq === 'string') {
            x.simpleTags.push({
              key: key1,
              value: t2.eq
            });
          } else {
            x.complexTags.push({ key: key1, tagInterface: t2 });
          }
        });
      }
    }
  });

  mproveFlags.forEach(mproveFlag =>
    mproveSimpleTags.push({ key: mproveFlag, value: undefined })
  );

  malloyFlags.forEach(malloyFlag =>
    malloySimpleTags.push({ key: malloyFlag, value: undefined })
  );

  // if (mproveSimpleTags.length > 0) {
  //   console.log('mproveSimpleTags');
  //   console.log(mproveSimpleTags);
  // }

  // if (malloySimpleTags.length > 0) {
  //   console.log('malloySimpleTags');
  //   console.log(malloySimpleTags);
  // }

  // if (mproveComplexTags.length > 0) {
  //   console.log('mproveComplexTags');
  //   console.log(mproveComplexTags);
  // }

  // if (malloyComplexTags.length > 0) {
  //   console.log('malloyComplexTags');
  //   console.log(malloyComplexTags);
  // }

  return {
    mproveTags: mproveSimpleTags,
    malloyTags: malloySimpleTags
  };
}
