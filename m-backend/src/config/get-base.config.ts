import { interfaces } from '../barrels/interfaces';
import { enums } from '../barrels/enums';
import { api } from '../barrels/api';
import { parse } from 'dotenv';
import * as fse from 'fs-extra';

export function getBaseConfig(envFilePath) {
  let envFile = parse(fse.readFileSync(envFilePath));

  let commonConfig: api.Config = api.getCommonConfig(envFile);

  let baseConfig: interfaces.Config = Object.assign({}, commonConfig, {
    backendEnv: <enums.BackendEnvEnum>envFile.BACKEND_ENV,
    backendDropDatabaseOnStart: <api.BoolEnum>(
      envFile.BACKEND_DROP_DATABASE_ON_START
    ),
    backendSyncDatabaseOnStart: <api.BoolEnum>(
      envFile.BACKEND_SYNC_DATABASE_ON_START
    ),
    backendRegisterOnlyInvitedUsers: <api.BoolEnum>(
      envFile.BACKEND_REGISTER_ONLY_INVITED_USERS
    ),
    backendFirstUserEmail: envFile.BACKEND_FIRST_USER_EMAIL,
    backendFirstUserPassword: envFile.BACKEND_FIRST_USER_PASSWORD,

    rabbitmqDefaultUser: envFile.RABBITMQ_DEFAULT_USER,
    rabbitmqDefaultPass: envFile.RABBITMQ_DEFAULT_PASS,

    mysqlRootPassword: envFile.MYSQL_ROOT_PASSWORD,
    mysqlDatabase: envFile.MYSQL_DATABASE
  });
  return baseConfig;
}
