import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { common } from '~disk/barrels/common';
import { enums } from '~disk/barrels/enums';
import { interfaces } from '~disk/barrels/interfaces';

export function getDevConfig(envFilePath: any) {
  let envFile;

  if (common.isDefined(envFilePath)) {
    envFile = parse(fse.readFileSync(envFilePath));
  }

  let commonConfig: common.Config = common.getCommonConfig(envFile);

  let devConfig: interfaces.Config = Object.assign({}, commonConfig, <
    interfaces.Config
  >{
    diskEnv: <enums.DiskEnvEnum>(process.env.DISK_ENV || envFile.DISK_ENV),

    rabbitUser: process.env.RABBIT_USER || envFile.RABBIT_USER,
    rabbitPass: process.env.RABBIT_PASS || envFile.RABBIT_PASS,
    rabbitHost: process.env.RABBIT_HOST || envFile.RABBIT_HOST,
    rabbitPort: process.env.RABBIT_PORT || envFile.RABBIT_PORT,
    rabbitProtocol: process.env.RABBIT_PROTOCOL || envFile.RABBIT_PROTOCOL,

    mDataOrgPath: process.env.M_DATA_ORG_PATH || envFile.M_DATA_ORG_PATH
  });
  return devConfig;
}
