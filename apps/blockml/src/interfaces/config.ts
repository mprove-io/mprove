import { IsEnum, IsInt, IsString } from 'class-validator';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';

export class Config {
  @IsEnum(enums.BlockmlEnvEnum)
  blockmlEnv?: enums.BlockmlEnvEnum;

  @IsEnum(common.BoolEnum)
  logIO?: common.BoolEnum;

  @IsEnum(common.FuncEnum)
  logFunc?: common.FuncEnum;

  @IsEnum(common.BoolEnum)
  copyLogsToModels?: common.BoolEnum;

  @IsString()
  logsPath?: string;

  @IsEnum(common.BoolEnum)
  isSingle?: common.BoolEnum;

  @IsEnum(common.BoolEnum)
  isMain?: common.BoolEnum;

  @IsEnum(common.BoolEnum)
  isWorker?: common.BoolEnum;

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

  @IsEnum(common.BoolEnum)
  blockmlLogIsJson?: common.BoolEnum;

  @IsEnum(common.BoolEnum)
  blockmlLogResponseError?: common.BoolEnum;

  @IsEnum(common.BoolEnum)
  blockmlLogResponseOk?: common.BoolEnum;
}
