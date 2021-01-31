import { IsEnum, IsString } from 'class-validator';
import { api } from '~disk/barrels/api';
import { enums } from '~disk/barrels/enums';

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
