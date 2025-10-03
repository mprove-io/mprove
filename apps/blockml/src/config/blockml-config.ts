import { IsEnum, IsInt, IsString } from 'class-validator';
import { BoolEnum } from '~common/enums/bool.enum';
import { BlockmlEnvEnum } from '~common/enums/env/blockml-env.enum';
import { FuncEnum } from '~common/enums/special/func.enum';

export class BlockmlConfig {
  @IsEnum(BlockmlEnvEnum)
  blockmlEnv?: BlockmlEnvEnum;

  @IsEnum(BoolEnum)
  logIO?: BoolEnum;

  @IsEnum(FuncEnum)
  logFunc?: FuncEnum;

  @IsEnum(BoolEnum)
  copyLogsToModels?: BoolEnum;

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

  @IsEnum(BoolEnum)
  blockmlLogIsJson?: BoolEnum;

  @IsEnum(BoolEnum)
  blockmlLogResponseError?: BoolEnum;

  @IsEnum(BoolEnum)
  blockmlLogResponseOk?: BoolEnum;
}
