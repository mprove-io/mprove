import { enums } from '../barrels/enums';
import { api } from '../barrels/api';
import { IsEnum, IsString } from 'class-validator';

export class Config {
  @IsEnum(enums.BackendEnvEnum)
  backendEnv: enums.BackendEnvEnum;

  @IsEnum(api.BoolEnum)
  backendDropDatabaseOnStart: api.BoolEnum;

  @IsEnum(api.BoolEnum)
  backendSyncDatabaseOnStart: api.BoolEnum;

  @IsEnum(api.BoolEnum)
  backendRegisterOnlyInvitedUsers: api.BoolEnum;

  @IsString()
  backendFirstUserEmail: string;

  @IsString()
  backendFirstUserPassword: string;

  @IsString()
  rabbitmqDefaultUser: string;

  @IsString()
  rabbitmqDefaultPass: string;

  @IsString()
  mysqlRootPassword: string;

  @IsString()
  mysqlDatabase: string;

  @IsEnum(api.LogTypeEnum)
  mproveLogType: api.LogTypeEnum;
}
