import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { common } from '~disk/barrels/common';
import { enums } from '~disk/barrels/enums';
import { interfaces } from '~disk/barrels/interfaces';

export function getDevConfig(envFilePath: any) {
  let env = common.isDefined(envFilePath)
    ? parse(fse.readFileSync(envFilePath))
    : process.env;

  let commonConfig: common.Config = common.getCommonConfig(env);

  let devConfig: interfaces.Config = Object.assign({}, commonConfig, <
    interfaces.Config
  >{
    diskEnv: <enums.DiskEnvEnum>env.DISK_ENV,

    rabbitUser: env.RABBIT_USER,
    rabbitPass: env.RABBIT_PASS,
    rabbitPort: env.RABBIT_PORT,
    rabbitProtocol: env.RABBIT_PROTOCOL,

    mDataOrgPath: env.M_DATA_ORG_PATH
  });
  return devConfig;
}
