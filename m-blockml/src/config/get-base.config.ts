import { interfaces } from '../barrels/interfaces';
import { enums } from '../barrels/enums';
import { api } from '../barrels/api';
import { parse } from 'dotenv';
import * as fse from 'fs-extra';

export function getBaseConfig(envFilePath) {
  let envFile = parse(fse.readFileSync(envFilePath));

  let config: interfaces.Config = {
    blockmlEnv: <enums.BlockmlEnvEnum>envFile.BLOCKML_ENV,
    blockmlLogIO: <api.BoolEnum>envFile.BLOCKML_LOG_IO,
    blockmlIsSingle: <api.BoolEnum>envFile.BLOCKML_IS_SINGLE,
    blockmlIsMain: <api.BoolEnum>envFile.BLOCKML_IS_MAIN,
    blockmlIsWorker: <api.BoolEnum>envFile.BLOCKML_IS_WORKER,
    blockmlConcurrencyLimit: Number(envFile.BLOCKML_CONCURRENCY_LIMIT),

    rabbitmqDefaultUser: envFile.RABBITMQ_DEFAULT_USER,
    rabbitmqDefaultPass: envFile.RABBITMQ_DEFAULT_PASS,

    mproveLogType: <api.LogTypeEnum>envFile.MPROVE_LOG_TYPE
  };
  return config;
}
