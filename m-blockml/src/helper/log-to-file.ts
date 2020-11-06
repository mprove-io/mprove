import * as fse from 'fs-extra';

import { enums } from '../barrels/enums';

export function logToFile(
  structId: string,
  pack: string,
  name: string,
  logInOut: enums.LogEnum,
  content: any
) {
  if (process.env.MPROVE_LOG_IO !== 'TRUE') {
    return;
  }

  let str = JSON.stringify(content, null, 2);

  let logNameString = name + logInOut.toString() + '.log';

  let modelsParent = `src/models/${pack}/logs`;
  let modelsPath = `${modelsParent}/${logNameString}`;

  let logsParent = `src/logs/${structId}/${pack}`;
  let logsPath = `${logsParent}/${logNameString}`;

  fse.ensureDirSync(modelsParent);
  fse.ensureDirSync(logsParent);

  fse.writeFileSync(modelsPath, str);
  fse.writeFileSync(logsPath, str);
}
