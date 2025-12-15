import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { DiskEnvEnum } from '~common/enums/env/disk-env.enum';

export class DiskConfig {
  @IsBoolean()
  isTelemetryEnabled?: boolean;

  @IsString()
  telemetryEndpoint?: string;

  @IsString()
  telemetryHyperdxIngestApiKey?: string;

  @IsString()
  otelLogLevel?: string;

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

  @IsBoolean()
  diskLogIsJson?: boolean;

  @IsBoolean()
  diskLogResponseError?: boolean;

  @IsBoolean()
  diskLogResponseOk?: boolean;
}
