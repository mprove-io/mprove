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

  @IsEnum(enums.TimeSpecEnum)
  timeSpec: enums.TimeSpecEnum;

  @IsString()
  timezone: string;

  @ValidateNested()
  @Type(() => Fraction)
  timeFilterFraction: Fraction;

  @ValidateNested()
  @Type(() => Row)
  rows: Row[];
}
