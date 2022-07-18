import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';

export function getDevConfig(envFilePath: any) {
  let envFile;

  if (common.isDefined(envFilePath)) {
    envFile = parse(fse.readFileSync(envFilePath));
  }

  let commonConfig: common.Config = common.getCommonConfig(envFile);

  let devConfig: interfaces.Config = Object.assign({}, commonConfig, <
    interfaces.Config
  >{
    blockmlEnv: <enums.BlockmlEnvEnum>(
      (process.env.BLOCKML_ENV || envFile.BLOCKML_ENV)
    ),
    logIO: <common.BoolEnum>(
      (process.env.BLOCKML_LOG_IO || envFile.BLOCKML_LOG_IO)
    ),
    logFunc: <enums.FuncEnum>(
      (process.env.BLOCKML_LOG_FUNC || envFile.BLOCKML_LOG_FUNC)
    ),
    copyLogsToModels: <common.BoolEnum>(
      (process.env.BLOCKML_COPY_LOGS_TO_MODELS ||
        envFile.BLOCKML_COPY_LOGS_TO_MODELS)
    ),
    logsPath: <common.BoolEnum>(
      (process.env.BLOCKML_LOGS_PATH || envFile.BLOCKML_LOGS_PATH)
    ),
    isSingle: <common.BoolEnum>(
      (process.env.BLOCKML_IS_SINGLE || envFile.BLOCKML_IS_SINGLE)
    ),
    isMain: <common.BoolEnum>(
      (process.env.BLOCKML_IS_MAIN || envFile.BLOCKML_IS_MAIN)
    ),
    isWorker: <common.BoolEnum>(
      (process.env.BLOCKML_IS_WORKER || envFile.BLOCKML_IS_WORKER)
    ),
    concurrencyLimit: Number(
      process.env.BLOCKML_CONCURRENCY_LIMIT || envFile.BLOCKML_CONCURRENCY_LIMIT
    ),

    rabbitUser: process.env.RABBIT_USER || envFile.RABBIT_USER,
    rabbitPass: process.env.RABBIT_PASS || envFile.RABBIT_PASS,
    rabbitHost: process.env.RABBIT_HOST || envFile.RABBIT_HOST,
    rabbitPort: process.env.RABBIT_PORT || envFile.RABBIT_PORT,
    rabbitProtocol: process.env.RABBIT_PROTOCOL || envFile.RABBIT_PROTOCOL
  });
  return devConfig;
}
