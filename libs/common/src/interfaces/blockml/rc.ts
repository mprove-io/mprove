import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';
import { IsTimezone } from '~common/functions/is-timezone';

export class Rc {
  @IsString()
  fractionBrick: string;

  @IsTimezone()
  timezone: string;

  @IsEnum(enums.TimeSpecEnum)
  timeSpec: enums.TimeSpecEnum;

  @IsString()
  kitId: string;

  @IsOptional()
  @IsInt()
  lastCalculatedTs: number;
}
