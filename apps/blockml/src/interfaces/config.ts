import { IsEnum, IsInt, IsString } from 'class-validator';
import { api } from '~blockml/barrels/api';
import { enums } from '~blockml/barrels/enums';

export class Config extends api.Config {
  @IsEnum(enums.BlockmlEnvEnum)
  blockmlEnv?: enums.BlockmlEnvEnum;

  @IsEnum(api.BoolEnum)
  logIO?: api.BoolEnum;

  @IsEnum(enums.FuncEnum)
  logFunc?: enums.FuncEnum;

  @IsEnum(api.BoolEnum)
  copyLogsToModels?: api.BoolEnum;

  @IsString()
  logsPath?: string;

  @IsEnum(api.BoolEnum)
  isSingle?: api.BoolEnum;

  @IsEnum(api.BoolEnum)
  isMain?: api.BoolEnum;

  @IsEnum(api.BoolEnum)
  isWorker?: api.BoolEnum;

  @IsInt()
  concurrencyLimit?: number;

  @IsString()
  rabbitmqDefaultUser?: string;

  @IsString()
  rabbitmqDefaultPass?: string;
}
