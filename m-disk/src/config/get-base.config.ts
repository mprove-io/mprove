import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { interfaces } from '~/barrels/interfaces';

export function getBaseConfig(envFilePath) {
  let envFile = parse(fse.readFileSync(envFilePath));

  let commonConfig: api.Config = api.getCommonConfig(envFile);

  let baseConfig: interfaces.Config = Object.assign({}, commonConfig, {
    diskEnv: <enums.DiskEnvEnum>envFile.DISK_ENV,

    rabbitmqDefaultUser: envFile.RABBITMQ_DEFAULT_USER,
    rabbitmqDefaultPass: envFile.RABBITMQ_DEFAULT_PASS,

    mDataOrgPath: envFile.M_DATA_ORG_PATH
  });
  return baseConfig;
}
