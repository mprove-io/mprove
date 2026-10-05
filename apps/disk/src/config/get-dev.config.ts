import { isDefined } from '#common/functions/is-defined/is-defined';
import { strToBoolean } from '#common/functions/str-to-boolean/str-to-boolean';
import type { DiskEnv } from '#common/types/node-common/env/disk-env';
import type { DiskConfig } from '#disk/config/disk-config';

export function getDevConfig() {
  let devConfig: DiskConfig = {
    isTelemetryEnabled: strToBoolean({
      value: process.env.IS_TELEMETRY_ENABLED,
      name: 'IS_TELEMETRY_ENABLED'
    }),

    telemetryEndpoint: process.env.TELEMETRY_ENDPOINT,

    telemetryHyperdxIngestApiKey: process.env.TELEMETRY_HYPERDX_INGEST_API_KEY,

    otelLogLevel: process.env.OTEL_LOG_LEVEL,

    diskEnv: <DiskEnv>process.env.DISK_ENV,

    aesKey: process.env.DISK_AES_KEY,

    diskShard: process.env.DISK_SHARD,

    diskConcurrency: isDefined(process.env.DISK_CONCURRENCY)
      ? Number(process.env.DISK_CONCURRENCY)
      : undefined,

    diskValkeyHost: process.env.DISK_VALKEY_HOST,

    diskValkeyPassword: process.env.DISK_VALKEY_PASSWORD,

    diskOrganizationsPath: process.env.DISK_ORGANIZATIONS_PATH,

    diskTestReposPath: process.env.DISK_TEST_REPOS_PATH,

    diskTestLocalSourceGitUrl: process.env.DISK_TEST_LOCAL_SOURCE_GIT_URL,

    diskLogIsJson: strToBoolean({
      value: process.env.DISK_LOG_IS_JSON,
      name: 'DISK_LOG_IS_JSON'
    }),
    diskLogResponseError: strToBoolean({
      value: process.env.DISK_LOG_RESPONSE_ERROR,
      name: 'DISK_LOG_RESPONSE_ERROR'
    }),
    diskLogResponseOk: strToBoolean({
      value: process.env.DISK_LOG_RESPONSE_OK,
      name: 'DISK_LOG_RESPONSE_OK'
    }),
    diskIsCheckSymlinksOnStartup: isDefined(
      process.env.DISK_IS_CHECK_SYMLINKS_ON_STARTUP
    )
      ? strToBoolean({
          value: process.env.DISK_IS_CHECK_SYMLINKS_ON_STARTUP,
          name: 'DISK_IS_CHECK_SYMLINKS_ON_STARTUP'
        })
      : undefined
  };
  return devConfig;
}
