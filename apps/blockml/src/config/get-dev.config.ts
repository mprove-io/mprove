import { BlockmlConfig } from '#blockml/config/blockml-config';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { strToBoolean } from '#common/functions/str-to-boolean/str-to-boolean';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { BlockmlEnv } from '#common/types/node-common/env/blockml-env';

export function getDevConfig() {
  let devConfig: BlockmlConfig = {
    isTelemetryEnabled: strToBoolean({
      value: process.env.IS_TELEMETRY_ENABLED,
      name: 'IS_TELEMETRY_ENABLED'
    }),

    telemetryEndpoint: process.env.TELEMETRY_ENDPOINT,

    telemetryHyperdxIngestApiKey: process.env.TELEMETRY_HYPERDX_INGEST_API_KEY,

    otelLogLevel: process.env.OTEL_LOG_LEVEL,

    blockmlEnv: <BlockmlEnv>process.env.BLOCKML_ENV,

    aesKey: process.env.BLOCKML_AES_KEY,

    logIO: strToBoolean({
      value: process.env.BLOCKML_LOG_IO,
      name: 'BLOCKML_LOG_IO'
    }),
    logFunc: <Func>process.env.BLOCKML_LOG_FUNC,
    copyLogsToModels: strToBoolean({
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

    blockmlLogIsJson: strToBoolean({
      value: process.env.BLOCKML_LOG_IS_JSON,
      name: 'BLOCKML_LOG_IS_JSON'
    }),
    blockmlLogResponseError: strToBoolean({
      value: process.env.BLOCKML_LOG_RESPONSE_ERROR,
      name: 'BLOCKML_LOG_RESPONSE_ERROR'
    }),
    blockmlLogResponseOk: strToBoolean({
      value: process.env.BLOCKML_LOG_RESPONSE_OK,
      name: 'BLOCKML_LOG_RESPONSE_OK'
    })
  };
  return devConfig;
}
