import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { api } from '~blockml/barrels/api';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';

export function getDevConfig(envFilePath) {
  let envFile = parse(fse.readFileSync(envFilePath));

  let commonConfig: api.Config = api.getCommonConfig(envFile);

  let devConfig: interfaces.Config = Object.assign({}, commonConfig, <
    interfaces.Config
  >{
    blockmlEnv: <enums.BlockmlEnvEnum>envFile.BLOCKML_ENV,
    logIO: <api.BoolEnum>envFile.BLOCKML_LOG_IO,
    logFunc: <enums.FuncEnum>envFile.BLOCKML_LOG_FUNC,
    copyLogsToModels: <api.BoolEnum>envFile.BLOCKML_COPY_LOGS_TO_MODELS,
    logsPath: <api.BoolEnum>envFile.BLOCKML_LOGS_PATH,
    isSingle: <api.BoolEnum>envFile.BLOCKML_IS_SINGLE,
    isMain: <api.BoolEnum>envFile.BLOCKML_IS_MAIN,
    isWorker: <api.BoolEnum>envFile.BLOCKML_IS_WORKER,
    concurrencyLimit: Number(envFile.BLOCKML_CONCURRENCY_LIMIT),

    rabbitmqDefaultUser: envFile.RABBITMQ_DEFAULT_USER,
    rabbitmqDefaultPass: envFile.RABBITMQ_DEFAULT_PASS
  });
  return devConfig;
}
