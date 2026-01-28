import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BlockmlEnvEnum } from '~common/enums/env/blockml-env.enum';
import { FuncEnum } from '~common/enums/special/func.enum';
import { enumToBoolean } from '~common/functions/enum-to-boolean';
import { isDefined } from '~common/functions/is-defined';

export function getDevConfig() {
  let devConfig: BlockmlConfig = {
    isTelemetryEnabled: enumToBoolean({
      value: process.env.IS_TELEMETRY_ENABLED,
      name: 'IS_TELEMETRY_ENABLED'
    }),

    telemetryEndpoint: process.env.TELEMETRY_ENDPOINT,

    telemetryHyperdxIngestApiKey: process.env.TELEMETRY_HYPERDX_INGEST_API_KEY,

    otelLogLevel: process.env.OTEL_LOG_LEVEL,

    blockmlEnv: <BlockmlEnvEnum>process.env.BLOCKML_ENV,

    aesKey: process.env.BLOCKML_AES_KEY,

    logIO: enumToBoolean({
      value: process.env.BLOCKML_LOG_IO,
      name: 'BLOCKML_LOG_IO'
    }),
    logFunc: <FuncEnum>process.env.BLOCKML_LOG_FUNC,
    copyLogsToModels: enumToBoolean({
      value: process.env.BLOCKML_COPY_LOGS_TO_MODELS,
      name: 'BLOCKML_COPY_LOGS_TO_MODELS'
    }),
    logsPath: process.env.BLOCKML_LOGS_PATH,
    concurrencyLimit: isDefined(process.env.BLOCKML_CONCURRENCY_LIMIT)
      ? Number(process.env.BLOCKML_CONCURRENCY_LIMIT)
      : undefined,

    blockmlValkeyHost: process.env.BLOCKML_VALKEY_HOST,

    blockmlValkeyPassword: process.env.BLOCKML_VALKEY_PASSWORD,

    blockmlData: process.env.BLOCKML_DATA,

    blockmlTestsDwhPostgresHost: process.env.BLOCKML_TESTS_DWH_POSTGRES_HOST,

    blockmlTestsDwhPostgresPort: process.env.BLOCKML_TESTS_DWH_POSTGRES_PORT,

    blockmlTestsDwhPostgresUsername:
      process.env.BLOCKML_TESTS_DWH_POSTGRES_USERNAME,

    blockmlTestsDwhPostgresPassword:
      process.env.BLOCKML_TESTS_DWH_POSTGRES_PASSWORD,

    blockmlTestsDwhPostgresDatabaseName:
      process.env.BLOCKML_TESTS_DWH_POSTGRES_DATABASE_NAME,

    blockmlLogIsJson: enumToBoolean({
      value: process.env.BLOCKML_LOG_IS_JSON,
      name: 'BLOCKML_LOG_IS_JSON'
    }),
    blockmlLogResponseError: enumToBoolean({
      value: process.env.BLOCKML_LOG_RESPONSE_ERROR,
      name: 'BLOCKML_LOG_RESPONSE_ERROR'
    }),
    blockmlLogResponseOk: enumToBoolean({
      value: process.env.BLOCKML_LOG_RESPONSE_OK,
      name: 'BLOCKML_LOG_RESPONSE_OK'
    })
  };
  return devConfig;
}
