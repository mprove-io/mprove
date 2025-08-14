import { common } from '~node-common/barrels/common';

export function getModAndMalloyQuery(item: {
  tileQuery: string;
  malloyFile: common.BmlFile;
  mods: common.FileMod[];
  malloyFiles: common.BmlFile[];
}) {
  let { tileQuery, malloyFile } = item;

  let source: string;
  let malloyQuery: string;

  let reg = common.MyRegex.MALLOY_QUERY_SOURCE(tileQuery);
  let r;

  if ((r = reg.exec(malloyFile.content))) {
    source = r[2];
    malloyQuery = 'run: ' + source + ' ' + r[3].trimEnd();
  }

  let mod = item.mods.find(x => x.source === source);

  return { mod: mod, malloyQuery: malloyQuery };
}
