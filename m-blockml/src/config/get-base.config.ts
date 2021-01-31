import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { interfaces } from '~/barrels/interfaces';

export function getBaseConfig(envFilePath) {
  let envFile = parse(fse.readFileSync(envFilePath));

  let commonConfig: api.Config = api.getCommonConfig(envFile);

  let baseConfig: interfaces.Config = Object.assign({}, commonConfig, {
    blockmlEnv: <enums.BlockmlEnvEnum>envFile.BLOCKML_ENV,
    blockmlLogIO: <api.BoolEnum>envFile.BLOCKML_LOG_IO,
    blockmlCopyLogsToModels: <api.BoolEnum>envFile.BLOCKML_COPY_LOGS_TO_MODELS,
    blockmlLogsPath: <api.BoolEnum>envFile.BLOCKML_LOGS_PATH,
    blockmlIsSingle: <api.BoolEnum>envFile.BLOCKML_IS_SINGLE,
    blockmlIsMain: <api.BoolEnum>envFile.BLOCKML_IS_MAIN,
    blockmlIsWorker: <api.BoolEnum>envFile.BLOCKML_IS_WORKER,
    blockmlConcurrencyLimit: Number(envFile.BLOCKML_CONCURRENCY_LIMIT),

    rabbitmqDefaultUser: envFile.RABBITMQ_DEFAULT_USER,
    rabbitmqDefaultPass: envFile.RABBITMQ_DEFAULT_PASS
  });
  return baseConfig;
}