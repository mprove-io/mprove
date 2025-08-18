import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { common } from '~disk/barrels/common';
import { DiskEnvEnum } from '~disk/enums/disk-env.enum';
import { Config } from '~disk/interfaces/config';

export function getDevConfig(envFilePath: any) {
  let envFile: any = {};

  if (common.isDefined(envFilePath)) {
    envFile = parse(fse.readFileSync(envFilePath));
  }

  let devConfig: Config = {
    diskEnv: <DiskEnvEnum>(process.env.DISK_ENV || envFile.DISK_ENV),

    diskRabbitUser: process.env.DISK_RABBIT_USER || envFile.DISK_RABBIT_USER,
    diskRabbitPass: process.env.DISK_RABBIT_PASS || envFile.DISK_RABBIT_PASS,
    diskRabbitHost: process.env.DISK_RABBIT_HOST || envFile.DISK_RABBIT_HOST,
    diskRabbitPort: process.env.DISK_RABBIT_PORT || envFile.DISK_RABBIT_PORT,
    diskRabbitProtocol:
      process.env.DISK_RABBIT_PROTOCOL || envFile.DISK_RABBIT_PROTOCOL,

    diskOrganizationsPath:
      process.env.DISK_ORGANIZATIONS_PATH || envFile.DISK_ORGANIZATIONS_PATH,

    diskLogIsJson: <common.BoolEnum>(
      (process.env.DISK_LOG_IS_JSON || envFile.DISK_LOG_IS_JSON)
    ),
    diskLogResponseError: <common.BoolEnum>(
      (process.env.DISK_LOG_RESPONSE_ERROR || envFile.DISK_LOG_RESPONSE_ERROR)
    ),
    diskLogResponseOk: <common.BoolEnum>(
      (process.env.DISK_LOG_RESPONSE_OK || envFile.DISK_LOG_RESPONSE_OK)
    )
  };
  return devConfig;
}
