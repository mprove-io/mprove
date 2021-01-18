import { interfaces } from '../barrels/interfaces';
import { enums } from '../barrels/enums';
import { api } from '../barrels/api';
import { parse } from 'dotenv';
import * as fse from 'fs-extra';

export function getBaseConfig() {
  let envFilePath = process.env.ENV_FILE_PATH;
  let envFile = parse(fse.readFileSync(envFilePath));

  let config: interfaces.Config = {
    backendEnv: <enums.BackendEnvEnum>envFile.BACKEND_ENV,

    backendFirstUserEmail: envFile.BACKEND_FIRST_USER_EMAIL,
    backendFirstUserPassword: envFile.BACKEND_FIRST_USER_PASSWORD,

    backendDropDatabaseOnStart: <api.BoolEnum>(
      envFile.BACKEND_DROP_DATABASE_ON_START
    ),

    backendSyncDatabaseOnStart: <api.BoolEnum>(
      envFile.BACKEND_SYNC_DATABASE_ON_START
    ),

    backendRegisterOnlyInvitedUsers: <api.BoolEnum>(
      envFile.BACKEND_REGISTER_ONLY_INVITED_USERS
    ),

    rabbitmqDefaultUser: envFile.RABBITMQ_DEFAULT_USER,
    rabbitmqDefaultPass: envFile.RABBITMQ_DEFAULT_PASS,

    mysqlRootPassword: envFile.MYSQL_ROOT_PASSWORD,
    mysqlDatabase: envFile.MYSQL_DATABASE,

    mproveLogType: <api.LogTypeEnum>envFile.MPROVE_LOG_TYPE
  };
  return config;
}
