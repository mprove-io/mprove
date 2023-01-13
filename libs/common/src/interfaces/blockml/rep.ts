import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '~common/barrels/enums';
import { Fraction } from './fraction';
import { Row } from './row';

export class Rep {
  @IsString()
  repId: string;

  @IsString()
  title: string;

  @IsString()
  timezone: string;

  @IsEnum(enums.TimeSpecEnum)
  timeSpec: enums.TimeSpecEnum;

  @ValidateNested()
  @Type(() => Fraction)
  timeRange: Fraction;

  @ValidateNested()
  @Type(() => Row)
  rows: Row[];
}
