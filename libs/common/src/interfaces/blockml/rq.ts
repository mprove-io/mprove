import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';
import { IsTimezone } from '~common/functions/is-timezone';

export class Rq {
  @IsString()
  fractionBrick: string;

  @IsTimezone()
  timezone: string;

  @IsEnum(enums.TimeSpecEnum)
  timeSpec: enums.TimeSpecEnum;

  @IsInt()
  timeStartTs: number;

  @IsInt()
  timeEndTs: number;

  @IsString()
  mconfigId: string;

  @IsString()
  queryId: string;

  @IsString()
  kitId: string;

  @IsOptional()
  @IsInt()
  lastCalculatedTs: number;
}
