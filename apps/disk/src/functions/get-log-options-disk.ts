import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { common } from '~disk/barrels/common';

export function getLogOptionsDisk() {
  let logIsColor = process.env.DISK_LOG_IS_COLOR as common.BoolEnum;
  let logIsStringify = process.env.DISK_LOG_IS_STRINGIFY as common.BoolEnum;

  if (common.isUndefined(logIsColor) || common.isUndefined(logIsStringify)) {
    let envFile: any = {};
    let envFilePath = process.env.ENV_FILE_PATH;

    if (common.isDefined(envFilePath)) {
      envFile = parse(fse.readFileSync(envFilePath));
    }

    if (common.isUndefined(logIsColor)) {
      logIsColor = envFile.DISK_LOG_IS_COLOR || common.BoolEnum.FALSE;
    }

    if (common.isUndefined(logIsStringify)) {
      logIsStringify = envFile.DISK_LOG_IS_STRINGIFY || common.BoolEnum.TRUE;
    }
  }

  return { logIsColor: logIsColor, logIsStringify: logIsStringify };
}
