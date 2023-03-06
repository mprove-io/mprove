import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, ValidateNested } from 'class-validator';
import { enums } from '~common/barrels/enums';
import { IsTimezone } from '~common/functions/is-timezone';
import { Fraction } from '../blockml/fraction';

export class Ui {
  @IsInt()
  metricsColumnNameWidth: number;

  @IsInt()
  metricsColumnParametersWidth: number;

  @IsBoolean()
  showMetricsModelName: boolean;

  @IsBoolean()
  showMetricsTimeFieldName: boolean;

  @IsBoolean()
  showMetricsChart: boolean;

  @IsBoolean()
  showMetricsChartSettings: boolean;

  @IsBoolean()
  showChartForSelectedRow: boolean;

  @IsTimezone()
  timezone: string;

  @IsEnum(enums.TimeSpecEnum)
  timeSpec: enums.TimeSpecEnum;

  @ValidateNested()
  @Type(() => Fraction)
  timeRangeFraction: Fraction;
}
