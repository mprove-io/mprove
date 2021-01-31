import { IsEnum, IsString } from 'class-validator';
import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';

export class Config extends api.Config {
  @IsEnum(enums.DiskEnvEnum)
  diskEnv?: enums.DiskEnvEnum;

  @IsString()
  rabbitmqDefaultUser?: string;

  @IsString()
  rabbitmqDefaultPass?: string;

  @IsString()
  mDataOrgPath?: string;
}
