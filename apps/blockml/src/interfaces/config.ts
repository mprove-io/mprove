import { IsEnum, IsInt, IsString } from 'class-validator';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';

export class Config extends common.Config {
  @IsEnum(enums.BlockmlEnvEnum)
  blockmlEnv?: enums.BlockmlEnvEnum;

  @IsEnum(common.BoolEnum)
  logIO?: common.BoolEnum;

  @IsEnum(enums.FuncEnum)
  logFunc?: enums.FuncEnum;

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
  rabbitUser?: string;

  @IsString()
  rabbitPass?: string;

  @IsString()
  rabbitProtocol?: string;

  @IsString()
  rabbitHost?: string;

  @IsString()
  rabbitPort?: string;
}
