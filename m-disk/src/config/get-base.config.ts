import { interfaces } from '../barrels/interfaces';
import { enums } from '../barrels/enums';
import { api } from '../barrels/api';
import { parse } from 'dotenv';
import * as fse from 'fs-extra';

export function getBaseConfig(envFilePath) {
  let envFile = parse(fse.readFileSync(envFilePath));

  let config: interfaces.Config = {
    diskEnv: <enums.DiskEnvEnum>envFile.DISK_ENV,

    rabbitmqDefaultUser: envFile.RABBITMQ_DEFAULT_USER,
    rabbitmqDefaultPass: envFile.RABBITMQ_DEFAULT_PASS,

    mDataOrgPath: envFile.M_DATA_ORG_PATH,

    mproveLogIsColor: <api.BoolEnum>envFile.MPROVE_LOG_IS_COLOR
  };
  return config;
}
