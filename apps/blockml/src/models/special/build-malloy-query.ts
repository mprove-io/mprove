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
    // connections: common.ProjectConnection[];
    // tempDir: string;
    // projectId: string;
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId, filePath, fileName, queryName, queryLineNum } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  console.log('filePath');
  console.log(filePath);

  console.log('fileName');
  console.log(fileName);

  console.log('queryName');
  console.log(queryName);

  console.log('queryLineNum');
  console.log(queryLineNum);

  return 1;
}
