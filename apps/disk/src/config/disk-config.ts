import { IsEnum, IsString } from 'class-validator';
import { BoolEnum } from '~common/enums/bool.enum';
import { DiskEnvEnum } from '~common/enums/env/disk-env.enum';

export class DiskConfig {
  @IsEnum(DiskEnvEnum)
  diskEnv?: DiskEnvEnum;

  @IsString()
  aesKey?: string;

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

  @IsEnum(BoolEnum)
  diskLogIsJson?: BoolEnum;

  @IsEnum(BoolEnum)
  diskLogResponseError?: BoolEnum;

  @IsEnum(BoolEnum)
  diskLogResponseOk?: BoolEnum;
}
