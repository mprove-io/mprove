import { enums } from '../barrels/enums';
import { api } from '../barrels/api';
import { IsEnum, IsString } from 'class-validator';

export class Config {
  @IsEnum(enums.DiskEnvEnum)
  diskEnv: enums.DiskEnvEnum;

  @IsString()
  rabbitmqDefaultUser: string;

  @IsString()
  rabbitmqDefaultPass: string;

  @IsString()
  mDataOrgPath: string;

  @IsEnum(api.BoolEnum)
  mproveLogIsColor: api.BoolEnum;
}
