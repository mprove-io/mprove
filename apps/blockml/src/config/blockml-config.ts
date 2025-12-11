import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString
} from 'class-validator';
import { BlockmlEnvEnum } from '~common/enums/env/blockml-env.enum';
import { FuncEnum } from '~common/enums/special/func.enum';

export class BlockmlConfig {
  @IsEnum(BlockmlEnvEnum)
  blockmlEnv?: BlockmlEnvEnum;

  @IsString()
  aesKey?: string;

  @IsString()
  blockmlHyperdxIngestionApiKey?: string;

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
  blockmlRabbitUser?: string;

  @IsString()
  blockmlRabbitPass?: string;

  @IsString()
  blockmlRabbitProtocol?: string;

  @IsString()
  blockmlRabbitHost?: string;

  @IsString()
  blockmlRabbitPort?: string;

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
