import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

export class Rq {
  @IsString()
  fractionBrick: string;

  @IsString()
  timezone: string;

  @IsEnum(enums.TimeSpecEnum)
  timeSpec: enums.TimeSpecEnum;

  @IsString()
  mconfigId: string;

  @IsString()
  queryId: string;

  @IsOptional()
  @IsInt()
  lastCalculatedTs: number;

  records: any[];
}
