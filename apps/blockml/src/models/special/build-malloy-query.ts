import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.BuildMalloyQuery;

export async function buildMalloyQuery(
  item: {
    filePath: string;
    fileName: string;
    queryName: string;
    queryLineNum: number;
    malloyFiles: common.BmlFile[];
    // connections: common.ProjectConnection[];
    // tempDir: string;
    // projectId: string;
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
    malloyFiles
  } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  // console.log('filePath');
  // console.log(filePath);

  // console.log('fileName');
  // console.log(fileName);

  // console.log('queryName');
  // console.log(queryName);

  // console.log('queryLineNum');
  // console.log(queryLineNum);

  // let a = filePath.lastIndexOf('.');
  // let a1 = filePath.substring(0, a);

  // console.log('a');
  // console.log(a);
  // console.log('a1');
  // console.log(a1);

  let malloyFile = malloyFiles.find(
    file =>
      file.path === filePath.substring(0, filePath.lastIndexOf('.')) + '.malloy'
  );

  if (common.isUndefined(malloyFile)) {
    // TODO: error
  }

  // console.log('malloyFile.content');
  // console.log(malloyFile.content);

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

  let match = queryPattern.exec(malloyFile.content);

  if (common.isDefined(match)) {
    let runText = 'run: ' + match[2] + ' ' + match[3].trimEnd();
    console.log('runText');
    console.log(runText);
  }

  return 1;
}
