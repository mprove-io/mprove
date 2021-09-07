import { IsEnum, IsString } from 'class-validator';
import { common } from '~disk/barrels/common';
import { enums } from '~disk/barrels/enums';

export class Config extends common.Config {
  @IsEnum(enums.DiskEnvEnum)
  diskEnv?: enums.DiskEnvEnum;

  @IsString()
  rabbitUser?: string;

  @IsString()
  rabbitPass?: string;

  @IsString()
  rabbitProtocol?: string;

  @IsString()
  rabbitHost?: string;

  @IsString()
  rabbitPort?: string;

  @IsString()
  mDataOrgPath?: string;
}
