// import { BmlFile } from '~common/interfaces/blockml/bml-file';
// import { FileMod } from '~common/interfaces/blockml/internal/file-mod';
// import { MyRegex } from '~common/models/my-regex';

// export function getModAndMalloyQuery(item: {
//   tileQuery: string;
//   malloyFile: BmlFile;
//   mods: FileMod[];
//   malloyFiles: BmlFile[];
// }) {
//   let { tileQuery, malloyFile } = item;

//   let source: string;
//   let malloyQuery: string;

//   let reg = MyRegex.MALLOY_QUERY_SOURCE(tileQuery);
//   let r;

//   if ((r = reg.exec(malloyFile.content))) {
//     source = r[2];
//     malloyQuery = 'run: ' + source + ' ' + r[3].trimEnd();
//   }

//   let mod = item.mods.find(x => x.source === source);

//   return { mod: mod, malloyQuery: malloyQuery };
// }
