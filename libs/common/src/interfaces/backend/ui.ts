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

  @IsInt()
  metricsTimeColumnsNarrowWidth: number;

  @IsInt()
  metricsTimeColumnsWideWidth: number;

  @IsBoolean()
  showMetricsModelName: boolean;

  @IsBoolean()
  showMetricsTimeFieldName: boolean;

  @IsBoolean()
  showMetricsChart: boolean;

  @IsBoolean()
  showMetricsChartSettings: boolean;

  @IsBoolean()
  showChartForSelectedRows: boolean;

  @IsEnum(enums.ModelTreeLevelsEnum)
  modelTreeLevels: enums.ModelTreeLevelsEnum;

  @IsTimezone()
  timezone: string;

  @IsEnum(enums.TimeSpecEnum)
  timeSpec: enums.TimeSpecEnum;

  @ValidateNested()
  @Type(() => Fraction)
  timeRangeFraction: Fraction;
}
