import { IsEnum, IsInt, IsString } from 'class-validator';
import { api } from '~blockml/barrels/api';
import { enums } from '~blockml/barrels/enums';

export class Config extends api.Config {
  @IsEnum(enums.BlockmlEnvEnum)
  blockmlEnv?: enums.BlockmlEnvEnum;

  @IsEnum(api.BoolEnum)
  blockmlLogIO?: api.BoolEnum;

  @IsEnum(enums.FuncEnum)
  blockmlLogFunc?: enums.FuncEnum;

  @IsEnum(api.BoolEnum)
  blockmlCopyLogsToModels?: api.BoolEnum;

  @IsString()
  blockmlLogsPath?: string;

  @IsEnum(api.BoolEnum)
  blockmlIsSingle?: api.BoolEnum;

  @IsEnum(api.BoolEnum)
  blockmlIsMain?: api.BoolEnum;

  @IsEnum(api.BoolEnum)
  blockmlIsWorker?: api.BoolEnum;

  @IsInt()
  blockmlConcurrencyLimit?: number;

  @IsString()
  rabbitmqDefaultUser?: string;

  @IsString()
  rabbitmqDefaultPass?: string;
}
