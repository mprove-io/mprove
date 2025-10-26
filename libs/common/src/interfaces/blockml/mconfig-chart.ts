import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { ChartTypeEnum } from '~common/enums/chart/chart-type.enum';
import { MconfigChartSeries } from './mconfig-chart-series';
import { MconfigChartXAxis } from './mconfig-chart-x-axis';
import { MconfigChartYAxis } from './mconfig-chart-y-axis';

export class MconfigChart {
  @IsBoolean()
  isValid: boolean;

  @IsEnum(ChartTypeEnum)
  type: ChartTypeEnum;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  xField?: string;

  @IsOptional()
  @IsString({ each: true })
  yFields?: string[];

  @IsOptional()
  @IsString()
  multiField?: string;

  @IsOptional()
  @IsString()
  sizeField?: string;

  @IsOptional()
  @IsBoolean()
  format?: boolean;

  @ValidateNested()
  @Type(() => MconfigChartXAxis)
  xAxis: MconfigChartXAxis;

  @ValidateNested()
  @Type(() => MconfigChartYAxis)
  yAxis: MconfigChartYAxis[];

  @ValidateNested()
  @Type(() => MconfigChartSeries)
  series: MconfigChartSeries[];
}
