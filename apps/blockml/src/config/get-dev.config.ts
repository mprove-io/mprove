import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';

export function getDevConfig(envFilePath: any) {
  let env = common.isDefined(envFilePath)
    ? parse(fse.readFileSync(envFilePath))
    : process.env;

  let commonConfig: common.Config = common.getCommonConfig(env);

  let devConfig: interfaces.Config = Object.assign({}, commonConfig, <
    interfaces.Config
  >{
    blockmlEnv: <enums.BlockmlEnvEnum>env.BLOCKML_ENV,
    logIO: <common.BoolEnum>env.BLOCKML_LOG_IO,
    logFunc: <enums.FuncEnum>env.BLOCKML_LOG_FUNC,
    copyLogsToModels: <common.BoolEnum>env.BLOCKML_COPY_LOGS_TO_MODELS,
    logsPath: <common.BoolEnum>env.BLOCKML_LOGS_PATH,
    isSingle: <common.BoolEnum>env.BLOCKML_IS_SINGLE,
    isMain: <common.BoolEnum>env.BLOCKML_IS_MAIN,
    isWorker: <common.BoolEnum>env.BLOCKML_IS_WORKER,
    concurrencyLimit: Number(env.BLOCKML_CONCURRENCY_LIMIT),

    rabbitUser: env.RABBIT_USER,
    rabbitPass: env.RABBIT_PASS,
    rabbitPort: env.RABBIT_PORT,
    rabbitProtocol: env.RABBIT_PROTOCOL
  });
  return devConfig;
}
