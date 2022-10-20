import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';

export function getDevConfig(envFilePath: any) {
  let envFile: any = {};

  if (common.isDefined(envFilePath)) {
    envFile = parse(fse.readFileSync(envFilePath));
  }

  let devConfig: interfaces.Config = {
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

    blockmlRabbitUser:
      process.env.BLOCKML_RABBIT_USER || envFile.BLOCKML_RABBIT_USER,
    blockmlRabbitPass:
      process.env.BLOCKML_RABBIT_PASS || envFile.BLOCKML_RABBIT_PASS,
    blockmlRabbitHost:
      process.env.BLOCKML_RABBIT_HOST || envFile.BLOCKML_RABBIT_HOST,
    blockmlRabbitPort:
      process.env.BLOCKML_RABBIT_PORT || envFile.BLOCKML_RABBIT_PORT,
    blockmlRabbitProtocol:
      process.env.BLOCKML_RABBIT_PROTOCOL || envFile.BLOCKML_RABBIT_PROTOCOL,

    blockmlLogIsColor: <common.BoolEnum>(
      (process.env.BLOCKML_LOG_IS_COLOR || envFile.BLOCKML_LOG_IS_COLOR)
    ),
    blockmlLogResponseError: <common.BoolEnum>(
      (process.env.BLOCKML_LOG_RESPONSE_ERROR ||
        envFile.BLOCKML_LOG_RESPONSE_ERROR)
    ),
    blockmlLogResponseOk: <common.BoolEnum>(
      (process.env.BLOCKML_LOG_RESPONSE_OK || envFile.BLOCKML_LOG_RESPONSE_OK)
    ),
    blockmlLogOnSender: <common.BoolEnum>(
      (process.env.BLOCKML_LOG_ON_SENDER || envFile.BLOCKML_LOG_ON_SENDER)
    ),
    blockmlLogOnResponser: <common.BoolEnum>(
      (process.env.BLOCKML_LOG_ON_RESPONSER || envFile.BLOCKML_LOG_ON_RESPONSER)
    )
  };
  return devConfig;
}
