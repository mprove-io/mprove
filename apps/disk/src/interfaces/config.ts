import { IsEnum, IsString } from 'class-validator';
import { common } from '~disk/barrels/common';
import { DiskEnvEnum } from '~disk/enums/disk-env.enum';

export class Config {
  @IsEnum(DiskEnvEnum)
  diskEnv?: DiskEnvEnum;

  @IsString()
  diskRabbitUser?: string;

  @IsString()
  diskRabbitPass?: string;

  @IsString()
  diskRabbitProtocol?: string;

  @IsString()
  diskRabbitHost?: string;

  @IsString()
  diskRabbitPort?: string;

  @IsString()
  diskOrganizationsPath?: string;

  @IsEnum(common.BoolEnum)
  diskLogIsJson?: common.BoolEnum;

  @IsEnum(common.BoolEnum)
  diskLogResponseError?: common.BoolEnum;

  @IsEnum(common.BoolEnum)
  diskLogResponseOk?: common.BoolEnum;
}
