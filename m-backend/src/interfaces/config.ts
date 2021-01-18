import { enums } from '../barrels/enums';
import { api } from '../barrels/api';
import { IsEnum, IsString } from 'class-validator';

export class Config {
  @IsEnum(api.LogTypeEnum)
  mproveLogType: api.LogTypeEnum;

  @IsString()
  rabbitmqDefaultUser: string;

  @IsString()
  rabbitmqDefaultPass: string;

  @IsString()
  mysqlRootPassword: string;

  @IsString()
  mysqlDatabase: string;

  @IsEnum(enums.BackendEnvEnum)
  backendEnv: enums.BackendEnvEnum;

  @IsEnum(api.BoolEnum)
  backendDropDatabaseOnStart: api.BoolEnum;

  @IsString()
  backendFirstUserEmail: string;

  @IsString()
  backendFirstUserPassword: string;

  @IsEnum(api.BoolEnum)
  backendRegisterOnlyInvitedUsers: api.BoolEnum;
}
