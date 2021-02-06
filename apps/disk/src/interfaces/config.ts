import { IsEnum, IsString } from 'class-validator';
import { common } from '~disk/barrels/common';
import { enums } from '~disk/barrels/enums';

export class Config extends common.Config {
  @IsEnum(enums.DiskEnvEnum)
  diskEnv?: enums.DiskEnvEnum;

  @IsString()
  rabbitmqDefaultUser?: string;

  @IsString()
  rabbitmqDefaultPass?: string;

  @IsString()
  mDataOrgPath?: string;
}
