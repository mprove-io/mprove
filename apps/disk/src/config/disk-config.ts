import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { DiskEnvEnum } from '~common/enums/env/disk-env.enum';

export class DiskConfig {
  @IsBoolean()
  isTelemetryEnabled?: boolean;

  @IsOptional()
  @IsString()
  telemetryEndpoint?: string;

  @IsOptional()
  @IsString()
  telemetryHyperdxIngestApiKey?: string;

  @IsOptional()
  @IsString()
  otelLogLevel?: string;

  @IsEnum(DiskEnvEnum)
  diskEnv?: DiskEnvEnum;

  @IsString()
  aesKey?: string;

  @IsString()
  diskShard?: string;

  @IsString()
  diskValkeyHost?: string;

  @IsString()
  diskValkeyPassword?: string;

  @IsString()
  diskOrganizationsPath?: string;

  @IsBoolean()
  diskLogIsJson?: boolean;

  @IsBoolean()
  diskLogResponseError?: boolean;

  @IsBoolean()
  diskLogResponseOk?: boolean;
}
