import { IsEnum, IsString } from 'class-validator';
import { common } from '~disk/barrels/common';
import { enums } from '~disk/barrels/enums';

export class Config {
  @IsEnum(enums.DiskEnvEnum)
  diskEnv?: enums.DiskEnvEnum;

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

  @IsEnum(common.BoolEnum)
  diskLogOnSender?: common.BoolEnum;

  @IsEnum(common.BoolEnum)
  diskLogOnResponser?: common.BoolEnum;
}
