import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '~common/barrels/enums';
import { Fraction } from '../blockml/fraction';

export class Ui {
  @IsBoolean()
  showMetricsChart: boolean;

  @IsBoolean()
  showMetricsChartSettings: boolean;

  @IsBoolean()
  showChartForSelectedRow: boolean;

  @IsString()
  timezone: string;

  @IsEnum(enums.TimeSpecEnum)
  timeSpec: enums.TimeSpecEnum;

  @ValidateNested()
  @Type(() => Fraction)
  timeRangeFraction: Fraction;
}
