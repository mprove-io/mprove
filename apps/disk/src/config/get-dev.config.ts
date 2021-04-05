import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { common } from '~disk/barrels/common';
import { enums } from '~disk/barrels/enums';
import { interfaces } from '~disk/barrels/interfaces';

export function getDevConfig(envFilePath) {
  let envFile = parse(fse.readFileSync(envFilePath));

  let commonConfig: common.Config = common.getCommonConfig(envFile);

  let devConfig: interfaces.Config = Object.assign({}, commonConfig, <
    interfaces.Config
  >{
    diskEnv: <enums.DiskEnvEnum>envFile.DISK_ENV,

    rabbitmqDefaultUser: envFile.RABBITMQ_DEFAULT_USER,
    rabbitmqDefaultPass: envFile.RABBITMQ_DEFAULT_PASS,

    mDataOrgPath: envFile.M_DATA_ORG_PATH
  });
  return devConfig;
}