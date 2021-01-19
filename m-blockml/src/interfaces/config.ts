import { enums } from '../barrels/enums';
import { api } from '../barrels/api';
import { IsEnum, IsInt, IsString } from 'class-validator';

export class Config {
  @IsEnum(enums.BlockmlEnvEnum)
  blockmlEnv: enums.BlockmlEnvEnum;

  @IsEnum(api.BoolEnum)
  blockmlLogIO: api.BoolEnum;

  @IsEnum(api.BoolEnum)
  blockmlIsSingle: api.BoolEnum;

  @IsEnum(api.BoolEnum)
  blockmlIsMain: api.BoolEnum;

  @IsEnum(api.BoolEnum)
  blockmlIsWorker: api.BoolEnum;

  @IsInt()
  blockmlConcurrencyLimit: number;

  @IsString()
  rabbitmqDefaultUser: string;

  @IsString()
  rabbitmqDefaultPass: string;

  @IsEnum(api.LogTypeEnum)
  mproveLogType: api.LogTypeEnum;
}
