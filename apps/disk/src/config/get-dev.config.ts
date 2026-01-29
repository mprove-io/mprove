import { DiskEnvEnum } from '#common/enums/env/disk-env.enum';
import { enumToBoolean } from '#common/functions/enum-to-boolean';
import { isDefined } from '#common/functions/is-defined';
import { DiskConfig } from '#disk/config/disk-config';

export function getDevConfig() {
  let devConfig: DiskConfig = {
    isTelemetryEnabled: enumToBoolean({
      value: process.env.IS_TELEMETRY_ENABLED,
      name: 'IS_TELEMETRY_ENABLED'
    }),

    telemetryEndpoint: process.env.TELEMETRY_ENDPOINT,

    telemetryHyperdxIngestApiKey: process.env.TELEMETRY_HYPERDX_INGEST_API_KEY,

    otelLogLevel: process.env.OTEL_LOG_LEVEL,

    diskEnv: <DiskEnvEnum>process.env.DISK_ENV,

    aesKey: process.env.DISK_AES_KEY,

    diskShard: process.env.DISK_SHARD,

    diskConcurrency: isDefined(process.env.DISK_CONCURRENCY)
      ? Number(process.env.DISK_CONCURRENCY)
      : undefined,

    diskValkeyHost: process.env.DISK_VALKEY_HOST,

    diskValkeyPassword: process.env.DISK_VALKEY_PASSWORD,

    diskOrganizationsPath: process.env.DISK_ORGANIZATIONS_PATH,

    diskLogIsJson: enumToBoolean({
      value: process.env.DISK_LOG_IS_JSON,
      name: 'DISK_LOG_IS_JSON'
    }),
    diskLogResponseError: enumToBoolean({
      value: process.env.DISK_LOG_RESPONSE_ERROR,
      name: 'DISK_LOG_RESPONSE_ERROR'
    }),
    diskLogResponseOk: enumToBoolean({
      value: process.env.DISK_LOG_RESPONSE_OK,
      name: 'DISK_LOG_RESPONSE_OK'
    })
  };
  return devConfig;
}
