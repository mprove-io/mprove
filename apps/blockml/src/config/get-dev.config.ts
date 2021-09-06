import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';

export function getDevConfig(envFilePath: any) {
  let envFile = parse(fse.readFileSync(envFilePath));

  let commonConfig: common.Config = common.getCommonConfig(envFile);

  let devConfig: interfaces.Config = Object.assign({}, commonConfig, <
    interfaces.Config
  >{
    blockmlEnv: <enums.BlockmlEnvEnum>envFile.BLOCKML_ENV,
    logIO: <common.BoolEnum>envFile.BLOCKML_LOG_IO,
    logFunc: <enums.FuncEnum>envFile.BLOCKML_LOG_FUNC,
    copyLogsToModels: <common.BoolEnum>envFile.BLOCKML_COPY_LOGS_TO_MODELS,
    logsPath: <common.BoolEnum>envFile.BLOCKML_LOGS_PATH,
    isSingle: <common.BoolEnum>envFile.BLOCKML_IS_SINGLE,
    isMain: <common.BoolEnum>envFile.BLOCKML_IS_MAIN,
    isWorker: <common.BoolEnum>envFile.BLOCKML_IS_WORKER,
    concurrencyLimit: Number(envFile.BLOCKML_CONCURRENCY_LIMIT),

    rabbitUser: envFile.RABBIT_USER,
    rabbitPass: envFile.RABBIT_PASS,
    rabbitPort: envFile.RABBIT_PORT,
    rabbitProtocol: envFile.RABBIT_PROTOCOL
  });
  return devConfig;
}
