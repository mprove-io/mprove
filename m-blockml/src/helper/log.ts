import * as fse from 'fs-extra';

import { enums } from '../barrels/enums';

export function log(
  caller: enums.CallerEnum,
  func: enums.FuncEnum,
  structId: string,
  logType: enums.LogTypeEnum,
  content: any
) {
  if (process.env.MPROVE_LOG_IO !== 'TRUE') {
    return;
  }

  let str = JSON.stringify(content, null, 2);

  let logTypeString = logType.toString();

  let dir = `src/logs/${caller}/${func}/${structId}`;
  let path = `${dir}/${logTypeString}`;

  fse.ensureDirSync(dir);
  fse.writeFileSync(path, str);
}
