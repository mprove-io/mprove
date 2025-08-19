import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { TimeSpecEnum } from '~common/enums/timespec.enum';
import { IsTimezone } from '~common/functions/is-timezone';

export class Rq {
  @IsString()
  fractionBrick: string;

  @IsTimezone()
  timezone: string;

  @IsEnum(TimeSpecEnum)
  timeSpec: TimeSpecEnum;

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
