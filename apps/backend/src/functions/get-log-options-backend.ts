import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { common } from '~backend/barrels/common';

export function getLogOptionsBackend() {
  let logIsColor = process.env.BACKEND_LOG_IS_COLOR as common.BoolEnum;
  let logIsStringify = process.env.BACKEND_LOG_IS_STRINGIFY as common.BoolEnum;

  if (common.isUndefined(logIsColor) || common.isUndefined(logIsStringify)) {
    let envFile: any = {};
    let envFilePath = process.env.ENV_FILE_PATH;

    if (common.isDefined(envFilePath)) {
      envFile = parse(fse.readFileSync(envFilePath));
    }

    if (common.isUndefined(logIsColor)) {
      logIsColor = envFile.BACKEND_LOG_IS_COLOR || common.BoolEnum.FALSE;
    }

    if (common.isUndefined(logIsStringify)) {
      logIsStringify = envFile.BACKEND_LOG_IS_STRINGIFY || common.BoolEnum.TRUE;
    }
  }

  return { logIsColor: logIsColor, logIsStringify: logIsStringify };
}
