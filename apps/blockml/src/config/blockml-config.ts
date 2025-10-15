import { IsBoolean, IsEnum, IsInt, IsString } from 'class-validator';
import { BlockmlEnvEnum } from '~common/enums/env/blockml-env.enum';
import { FuncEnum } from '~common/enums/special/func.enum';

export class BlockmlConfig {
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

  @IsString()
  blockmlTestsDwhPostgresHost?: string;

  @IsString()
  blockmlTestsDwhPostgresPort?: string;

  @IsString()
  blockmlTestsDwhPostgresUsername?: string;

  @IsString()
  blockmlTestsDwhPostgresPassword?: string;

  @IsString()
  blockmlTestsDwhPostgresDatabaseName?: string;

  @IsBoolean()
  blockmlLogIsJson?: boolean;

  @IsBoolean()
  blockmlLogResponseError?: boolean;

  @IsBoolean()
  blockmlLogResponseOk?: boolean;
}
