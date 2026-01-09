import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { isDefined } from '~common/functions/is-defined';

import { DiskEnvEnum } from '~common/enums/env/disk-env.enum';
import { enumToBoolean } from '~common/functions/enum-to-boolean';
import { DiskConfig } from '~disk/config/disk-config';

export function getDevConfig(envFilePath: any) {
  let envFile: { [name: string]: string } = {};

  if (isDefined(envFilePath)) {
    envFile = parse(fse.readFileSync(envFilePath));
  }

  let devConfig: DiskConfig = {
    isTelemetryEnabled: enumToBoolean({
      value: process.env.IS_TELEMETRY_ENABLED || envFile.IS_TELEMETRY_ENABLED,
      name: 'IS_TELEMETRY_ENABLED'
    }),

    telemetryEndpoint:
      process.env.TELEMETRY_ENDPOINT || envFile.TELEMETRY_ENDPOINT,

    telemetryHyperdxIngestApiKey:
      process.env.TELEMETRY_HYPERDX_INGEST_API_KEY ||
      envFile.TELEMETRY_HYPERDX_INGEST_API_KEY,

    otelLogLevel: process.env.OTEL_LOG_LEVEL || envFile.OTEL_LOG_LEVEL,

    diskEnv: <DiskEnvEnum>(process.env.DISK_ENV || envFile.DISK_ENV),

    aesKey: process.env.DISK_AES_KEY || envFile.DISK_AES_KEY,

    diskPart: process.env.DISK_PART || envFile.DISK_PART,

    diskValkeyHost: process.env.DISK_VALKEY_HOST || envFile.DISK_VALKEY_HOST,

    diskValkeyPassword:
      process.env.DISK_VALKEY_PASSWORD || envFile.DISK_VALKEY_PASSWORD,

    diskRabbitUser: process.env.DISK_RABBIT_USER || envFile.DISK_RABBIT_USER,
    diskRabbitPass: process.env.DISK_RABBIT_PASS || envFile.DISK_RABBIT_PASS,
    diskRabbitHost: process.env.DISK_RABBIT_HOST || envFile.DISK_RABBIT_HOST,
    diskRabbitPort: process.env.DISK_RABBIT_PORT || envFile.DISK_RABBIT_PORT,
    diskRabbitProtocol:
      process.env.DISK_RABBIT_PROTOCOL || envFile.DISK_RABBIT_PROTOCOL,

    diskOrganizationsPath:
      process.env.DISK_ORGANIZATIONS_PATH || envFile.DISK_ORGANIZATIONS_PATH,

    diskLogIsJson: enumToBoolean({
      value: process.env.DISK_LOG_IS_JSON || envFile.DISK_LOG_IS_JSON,
      name: 'DISK_LOG_IS_JSON'
    }),
    diskLogResponseError: enumToBoolean({
      value:
        process.env.DISK_LOG_RESPONSE_ERROR || envFile.DISK_LOG_RESPONSE_ERROR,
      name: 'DISK_LOG_RESPONSE_ERROR'
    }),
    diskLogResponseOk: enumToBoolean({
      value: process.env.DISK_LOG_RESPONSE_OK || envFile.DISK_LOG_RESPONSE_OK,
      name: 'DISK_LOG_RESPONSE_OK'
    })
  };
  return devConfig;
}
