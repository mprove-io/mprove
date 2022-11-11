import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { common } from '~disk/barrels/common';
import { enums } from '~disk/barrels/enums';
import { interfaces } from '~disk/barrels/interfaces';

export function getDevConfig(envFilePath: any) {
  let envFile: any = {};

  if (common.isDefined(envFilePath)) {
    envFile = parse(fse.readFileSync(envFilePath));
  }

  let devConfig: interfaces.Config = {
    diskEnv: <enums.DiskEnvEnum>(process.env.DISK_ENV || envFile.DISK_ENV),

    diskRabbitUser: process.env.DISK_RABBIT_USER || envFile.DISK_RABBIT_USER,
    diskRabbitPass: process.env.DISK_RABBIT_PASS || envFile.DISK_RABBIT_PASS,
    diskRabbitHost: process.env.DISK_RABBIT_HOST || envFile.DISK_RABBIT_HOST,
    diskRabbitPort: process.env.DISK_RABBIT_PORT || envFile.DISK_RABBIT_PORT,
    diskRabbitProtocol:
      process.env.DISK_RABBIT_PROTOCOL || envFile.DISK_RABBIT_PROTOCOL,

    diskOrganizationsPath:
      process.env.DISK_ORGANIZATIONS_PATH || envFile.DISK_ORGANIZATIONS_PATH,

    diskLogIsStringify: <common.BoolEnum>(
      (process.env.DISK_LOG_IS_STRINGIFY || envFile.DISK_LOG_IS_STRINGIFY)
    ),
    diskLogIsColor: <common.BoolEnum>(
      (process.env.DISK_LOG_IS_COLOR || envFile.DISK_LOG_IS_COLOR)
    ),
    diskLogResponseError: <common.BoolEnum>(
      (process.env.DISK_LOG_RESPONSE_ERROR || envFile.DISK_LOG_RESPONSE_ERROR)
    ),
    diskLogResponseOk: <common.BoolEnum>(
      (process.env.DISK_LOG_RESPONSE_OK || envFile.DISK_LOG_RESPONSE_OK)
    ),
    diskLogOnSender: <common.BoolEnum>(
      (process.env.DISK_LOG_ON_SENDER || envFile.DISK_LOG_ON_SENDER)
    ),
    diskLogOnResponser: <common.BoolEnum>(
      (process.env.DISK_LOG_ON_RESPONSER || envFile.DISK_LOG_ON_RESPONSER)
    )
  };
  return devConfig;
}
