import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { BoolEnum } from '~common/enums/bool.enum';
import { BlockmlEnvEnum } from '~common/enums/env/blockml-env.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { isDefined } from '~common/functions/is-defined';
import { BlockmlConfig } from '~common/interfaces/blockml/blockml-config';

export function getDevConfig(envFilePath: any) {
  let envFile: any = {};

  if (isDefined(envFilePath)) {
    envFile = parse(fse.readFileSync(envFilePath));
  }

  let devConfig: BlockmlConfig = {
    blockmlEnv: <BlockmlEnvEnum>(
      (process.env.BLOCKML_ENV || envFile.BLOCKML_ENV)
    ),
    logIO: <BoolEnum>(process.env.BLOCKML_LOG_IO || envFile.BLOCKML_LOG_IO),
    logFunc: <FuncEnum>(
      (process.env.BLOCKML_LOG_FUNC || envFile.BLOCKML_LOG_FUNC)
    ),
    copyLogsToModels: <BoolEnum>(
      (process.env.BLOCKML_COPY_LOGS_TO_MODELS ||
        envFile.BLOCKML_COPY_LOGS_TO_MODELS)
    ),
    logsPath: <BoolEnum>(
      (process.env.BLOCKML_LOGS_PATH || envFile.BLOCKML_LOGS_PATH)
    ),
    isSingle: <BoolEnum>(
      (process.env.BLOCKML_IS_SINGLE || envFile.BLOCKML_IS_SINGLE)
    ),
    isMain: <BoolEnum>(process.env.BLOCKML_IS_MAIN || envFile.BLOCKML_IS_MAIN),
    isWorker: <BoolEnum>(
      (process.env.BLOCKML_IS_WORKER || envFile.BLOCKML_IS_WORKER)
    ),
    concurrencyLimit: Number(
      isDefined(process.env.BLOCKML_CONCURRENCY_LIMIT)
        ? process.env.BLOCKML_CONCURRENCY_LIMIT
        : envFile.BLOCKML_CONCURRENCY_LIMIT
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

    blockmlData: process.env.BLOCKML_DATA || envFile.BLOCKML_DATA,

    blockmlTestsDwhPostgresHost:
      process.env.BLOCKML_TESTS_DWH_POSTGRES_HOST ||
      envFile.BLOCKML_TESTS_DWH_POSTGRES_HOST,

    blockmlTestsDwhPostgresPort:
      process.env.BLOCKML_TESTS_DWH_POSTGRES_PORT ||
      envFile.BLOCKML_TESTS_DWH_POSTGRES_PORT,

    blockmlTestsDwhPostgresUsername:
      process.env.BLOCKML_TESTS_DWH_POSTGRES_USERNAME ||
      envFile.BLOCKML_TESTS_DWH_POSTGRES_USERNAME,

    blockmlTestsDwhPostgresPassword:
      process.env.BLOCKML_TESTS_DWH_POSTGRES_PASSWORD ||
      envFile.BLOCKML_TESTS_DWH_POSTGRES_PASSWORD,

    blockmlTestsDwhPostgresDatabaseName:
      process.env.BLOCKML_TESTS_DWH_POSTGRES_DATABASE_NAME ||
      envFile.BLOCKML_TESTS_DWH_POSTGRES_DATABASE_NAME,

    blockmlLogIsJson: <BoolEnum>(
      (process.env.BLOCKML_LOG_IS_JSON || envFile.BLOCKML_LOG_IS_JSON)
    ),
    blockmlLogResponseError: <BoolEnum>(
      (process.env.BLOCKML_LOG_RESPONSE_ERROR ||
        envFile.BLOCKML_LOG_RESPONSE_ERROR)
    ),
    blockmlLogResponseOk: <BoolEnum>(
      (process.env.BLOCKML_LOG_RESPONSE_OK || envFile.BLOCKML_LOG_RESPONSE_OK)
    )
  };
  return devConfig;
}
