import { interfaces } from '../barrels/interfaces';
import { enums } from '../barrels/enums';
import { api } from '../barrels/api';

export default () => {
  let config: interfaces.Config = {
    mproveLogType:
      <api.LogTypeEnum>process.env.MPROVE_LOG_TYPE || api.LogTypeEnum.DEV,

    rabbitmqDefaultUser: process.env.RABBITMQ_DEFAULT_USER,
    rabbitmqDefaultPass: process.env.RABBITMQ_DEFAULT_PASS,
    mysqlRootPassword: process.env.MYSQL_ROOT_PASSWORD,
    mysqlDatabase: process.env.MYSQL_DATABASE,

    backendEnv: <enums.BackendEnvEnum>process.env.BACKEND_ENV_CONFIG,
    backendFirstUserEmail: process.env.BACKEND_FIRST_USER_EMAIL,
    backendFirstUserPassword: process.env.BACKEND_FIRST_USER_PASSWORD,

    backendDropDatabaseOnStart:
      <api.BoolEnum>process.env.BACKEND_DROP_DATABASE_ON_START ||
      api.BoolEnum.TRUE,

    backendRegisterOnlyInvitedUsers:
      <api.BoolEnum>process.env.BACKEND_REGISTER_ONLY_INVITED_USERS ||
      api.BoolEnum.FALSE
  };
  return config;
};
