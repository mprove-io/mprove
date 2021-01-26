import { IsEnum, IsString } from 'class-validator';
import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';

export class Config extends api.Config {
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
}
