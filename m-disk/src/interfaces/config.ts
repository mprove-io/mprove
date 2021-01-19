import { enums } from '../barrels/enums';
import { api } from '../barrels/api';
import { IsEnum, IsString } from 'class-validator';

export class Config {
  @IsEnum(enums.DiskEnvEnum)
  diskEnv: enums.DiskEnvEnum;

  @IsString()
  mproveMDataOrganizationsPath: string;

  @IsString()
  rabbitmqDefaultUser: string;

  @IsString()
  rabbitmqDefaultPass: string;

  @IsEnum(api.LogTypeEnum)
  mproveLogType: api.LogTypeEnum;
}
