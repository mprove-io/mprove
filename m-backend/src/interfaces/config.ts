import { enums } from '../barrels/enums';
import { api } from '../barrels/api';

export interface Config {
  mproveLogType: api.LogTypeEnum;
  rabbitmqDefaultUser: string;
  rabbitmqDefaultPass: string;
  mysqlRootPassword: string;
  mysqlDatabase: string;

  backendEnv: enums.BackendEnvEnum;
  backendDropDatabaseOnStart: api.BoolEnum;
  backendFirstUserEmail: string;
  backendFirstUserPassword: string;
  backendRegisterOnlyInvitedUsers: api.BoolEnum;
}
