import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { common } from '~disk/barrels/common';
import { enums } from '~disk/barrels/enums';
import { interfaces } from '~disk/barrels/interfaces';

export function getDevConfig(envFilePath: any) {
  let envFile = parse(fse.readFileSync(envFilePath));

  let commonConfig: common.Config = common.getCommonConfig(envFile);

  let devConfig: interfaces.Config = Object.assign({}, commonConfig, <
    interfaces.Config
  >{
    diskEnv: <enums.DiskEnvEnum>envFile.DISK_ENV,

    rabbitUser: envFile.RABBIT_USER,
    rabbitPass: envFile.RABBIT_PASS,
    rabbitPort: envFile.RABBIT_PORT,
    rabbitProtocol: envFile.RABBIT_PROTOCOL,

    mDataOrgPath: envFile.M_DATA_ORG_PATH
  });
  return devConfig;
}
