import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  // IsNumber,
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
  description?: string;

  @IsOptional()
  @IsString()
  xField?: string;

  @IsOptional()
  @IsString({ each: true })
  yFields?: string[];

  // @IsOptional()
  // @IsString({ each: true })
  // hideColumns?: string[];

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

  // @IsOptional()
  // @IsBoolean()
  // gradient?: boolean;

  // @IsOptional()
  // @IsBoolean()
  // legend?: boolean;

  // @IsOptional()
  // @IsString()
  // legendTitle?: string;

  // @IsOptional()
  // @IsBoolean()
  // tooltipDisabled?: boolean;

  // @IsOptional()
  // @IsBoolean()
  // roundEdges?: boolean;

  // @IsOptional()
  // @IsBoolean()
  // roundDomains?: boolean;

  // @IsOptional()
  // @IsBoolean()
  // showGridLines?: boolean;

  // @IsOptional()
  // @IsBoolean()
  // timeline?: boolean;

  // @IsOptional()
  // @IsEnum(ChartInterpolationEnum)
  // interpolation?: ChartInterpolationEnum;

  // @IsOptional()
  // @IsBoolean()
  // autoScale?: boolean;

  // @IsOptional()
  // @IsBoolean()
  // doughnut?: boolean;

  // @IsOptional()
  // @IsBoolean()
  // explodeSlices?: boolean;

  // @IsOptional()
  // @IsBoolean()
  // labels?: boolean;

  // @IsOptional()
  // @IsEnum(ChartColorSchemeEnum)
  // colorScheme?: ChartColorSchemeEnum;

  // @IsOptional()
  // @IsEnum(ChartSchemeTypeEnum)
  // schemeType?: any;

  // @IsOptional()
  // @IsNumber()
  // arcWidth?: number;

  // @IsOptional()
  // @IsInt()
  // barPadding?: number;

  // @IsOptional()
  // @IsInt()
  // groupPadding?: number;

  // @IsOptional()
  // @IsInt()
  // innerPadding?: number;

  // @IsOptional() // absent in docs
  // @IsNumber()
  // rangeFillOpacity?: number;

  // @IsOptional()
  // @IsInt()
  // angleSpan?: number;

  // @IsOptional()
  // @IsInt()
  // startAngle?: number;

  // @IsOptional()
  // @IsInt()
  // bigSegments?: number;

  // @IsOptional()
  // @IsInt()
  // smallSegments?: number;

  // @IsOptional()
  // @IsInt()
  // min?: number;

  // @IsOptional()
  // @IsInt()
  // max?: number;

  // @IsOptional()
  // @IsString()
  // units?: string;

  // @IsOptional()
  // @IsNumber()
  // yScaleMin?: number;

  // @IsOptional()
  // @IsNumber()
  // yScaleMax?: number;

  // @IsOptional()
  // @IsNumber()
  // xScaleMax?: number;

  // @IsOptional()
  // @IsString()
  // bandColor?: string;

  // @IsOptional()
  // @IsString()
  // cardColor?: string;

  // @IsOptional()
  // @IsString()
  // textColor?: string;

  // @IsOptional()
  // @IsString()
  // emptyColor?: string;

  // @IsOptional()
  // @IsString()
  // formatNumberDataLabel?: string;

  // @IsOptional()
  // @IsString()
  // formatNumberValue?: string;

  // @IsOptional()
  // @IsString()
  // formatNumberAxisTick?: string;

  // @IsOptional()
  // @IsString()
  // formatNumberYAxisTick?: string;

  // @IsOptional()
  // @IsString()
  // formatNumberXAxisTick?: string;

  //
  // axis
  //

  // @IsOptional()
  // @IsBoolean()
  // xAxis?: boolean;

  // @IsOptional()
  // @IsBoolean()
  // showXAxisLabel?: boolean;

  // @IsOptional()
  // @IsString()
  // xAxisLabel?: string;

  // @IsOptional()
  // @IsBoolean()
  // yAxis?: boolean;

  // @IsOptional()
  // @IsBoolean()
  // showYAxisLabel?: boolean;

  // @IsOptional()
  // @IsString()
  // yAxisLabel?: string;

  // @IsOptional()
  // @IsBoolean()
  // showAxis?: boolean;

  // @IsOptional()
  // @IsBoolean()
  // animations?: boolean;

  // @IsOptional()
  // @IsBoolean()
  // showDataLabel?: boolean;
}
