import * as fse from 'fs-extra';

import { enums } from '../barrels/enums';

export function log(
  structId: string,
  logPack: string,
  logFolder: string,
  logName: enums.LogEnum,
  content: any
) {
  if (process.env.MPROVE_LOG_IO !== 'TRUE') {
    return;
  }

  let str = JSON.stringify(content, null, 2);

  let logNameString = logName.toString();

  let modelsParent = `src/models/${logPack}/logs/${logFolder}`;
  let modelsPath = `${modelsParent}/${logNameString}`;

  let srcParent = `src/logs/${structId}/${logPack}/${logFolder}`;
  let srcPath = `${srcParent}/${logNameString}`;

  fse.ensureDirSync(modelsParent);
  fse.ensureDirSync(srcParent);

  fse.writeFileSync(modelsPath, str);
  fse.writeFileSync(srcPath, str);
}
