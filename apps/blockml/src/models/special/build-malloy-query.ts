import { PostgresConnection } from '@malloydata/db-postgres';
import {
  ModelMaterializer,
  PreparedQuery,
  QueryMaterializer,
  Runtime
} from '@malloydata/malloy';
import { ConfigService } from '@nestjs/config';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.BuildMalloyQuery;

export async function buildMalloyQuery(
  item: {
    malloyConnections: PostgresConnection[];
    filePath: string;
    fileName: string;
    queryName: string;
    queryLineNum: number;
    malloyFiles: common.BmlFile[];
    mods: common.FileMod[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let {
    caller,
    structId,
    filePath,
    fileName,
    queryName,
    queryLineNum,
    malloyFiles,
    mods
  } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let malloyFile = malloyFiles.find(
    file =>
      file.path === filePath.substring(0, filePath.lastIndexOf('.')) + '.malloy'
  );

  if (common.isUndefined(malloyFile)) {
    // TODO: error
  }

  // tool
  // query:\s*(mc3)\s+is\s*([\s\S]*?)(?=(?:\nquery:\s*\w+\sis|source:\s|\nrun:\s|\nimport\s*{|\nimport\s*'|\nimport\s*"|$))

  let queryPattern = new RegExp(
    [
      `query:`,
      `\\s*`,
      `(${queryName})`,
      `\\s+`,
      `is`,
      `\\s+`,
      `(\\w+)`,
      `\\s+`,
      `([\\s\\S]*?)`,
      `(?=`,
      `(?:`,
      `\\nquery:\\s*\\w+\\sis`,
      `|source:\\s`,
      `|\\nrun:\\s`,
      `|\\nimport\\s*\\{`,
      `|\\nimport\\s*\\'`,
      `|\\nimport\\s*\\"`,
      `|$`,
      `)`,
      `)`
    ].join(''),
    'g'
  );

  let source: string;
  let queryStr: string;

  let match = queryPattern.exec(malloyFile.content);

  if (common.isDefined(match)) {
    source = match[2];

    queryStr = 'run: ' + source + ' ' + match[3].trimEnd();
    // console.log('queryStr');
    // console.log(queryStr);
  }

  let mod = mods.find(x => x.source === source);

  // let start100 = Date.now();
  let runtime = new Runtime({
    urlReader: {
      readURL: async (url: URL) => await fse.readFile(url, 'utf8')
    },
    connections: {
      lookupConnection: async function (name: string) {
        return item.malloyConnections.find(mc => mc.name === name);
      }
    }
  });

  let mm: ModelMaterializer = runtime._loadModelFromModelDef(
    mod.malloyModel._modelDef
  );
  // console.log('diff100');
  // console.log(Date.now() - start100); // 0ms

  // let start101 = Date.now();
  let qm: QueryMaterializer = mm.loadQuery(queryStr); // 0 ms
  // console.log('diff101');
  // console.log(Date.now() - start101); // 0ms

  let start102 = Date.now();

  let aSql = await qm.getSQL();

  console.log('diff102');
  console.log(Date.now() - start102); // 14ms

  // console.log('aSql');
  // console.log(aSql);

  // let start103 = Date.now();
  let pq: PreparedQuery = await qm.getPreparedQuery();
  // console.log('diff103');
  // console.log(Date.now() - start103); // 0ms

  // console.log('pq');
  // console.dir(pq, { depth: null });

  return 1;
}
