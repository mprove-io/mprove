import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString
} from 'class-validator';
import { BlockmlEnvEnum } from '#common/enums/env/blockml-env.enum';
import { FuncEnum } from '#common/enums/special/func.enum';

export class BlockmlConfig {
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

  @IsEnum(BlockmlEnvEnum)
  blockmlEnv?: BlockmlEnvEnum;

  @IsString()
  aesKey?: string;

  @IsBoolean()
  logIO?: boolean;

  @IsEnum(FuncEnum)
  logFunc?: FuncEnum;

  @IsBoolean()
  copyLogsToModels?: boolean;

  @IsString()
  logsPath?: string;

  @IsInt()
  concurrencyLimit?: number;

  @IsString()
  blockmlValkeyHost?: string;

  @IsString()
  blockmlValkeyPassword?: string;

  @IsString()
  blockmlData?: string;

  @IsOptional()
  @IsString()
  blockmlTestsDwhPostgresHost?: string;

  @IsOptional()
  @IsString()
  blockmlTestsDwhPostgresPort?: string;

  @IsOptional()
  @IsString()
  blockmlTestsDwhPostgresUsername?: string;

  @IsOptional()
  @IsString()
  blockmlTestsDwhPostgresPassword?: string;

  @IsOptional()
  @IsString()
  blockmlTestsDwhPostgresDatabaseName?: string;

  @IsBoolean()
  blockmlLogIsJson?: boolean;

  @IsBoolean()
  blockmlLogResponseError?: boolean;

  @IsBoolean()
  blockmlLogResponseOk?: boolean;
}
