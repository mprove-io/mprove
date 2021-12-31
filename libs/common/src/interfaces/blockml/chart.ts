import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';
import { enums } from '~common/barrels/enums';

export class Chart {
  @IsBoolean()
  isValid: boolean;

  @IsEnum(enums.ChartTypeEnum)
  type: enums.ChartTypeEnum;

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
  @IsString()
  yField?: string;

  @IsOptional()
  @IsString({ each: true })
  yFields?: string[];

  @IsOptional()
  @IsString({ each: true })
  hideColumns?: string[];

  @IsOptional()
  @IsString()
  multiField?: string;

  @IsOptional()
  @IsString()
  valueField?: string;

  @IsOptional()
  @IsString()
  previousValueField?: string;

  @IsOptional()
  @IsBoolean()
  xAxis?: boolean;

  @IsOptional()
  @IsBoolean()
  showXAxisLabel?: boolean;

  @IsOptional()
  @IsString()
  xAxisLabel?: string;

  @IsOptional()
  @IsBoolean()
  yAxis?: boolean;

  @IsOptional()
  @IsBoolean()
  showYAxisLabel?: boolean;

  @IsOptional()
  @IsString()
  yAxisLabel?: string;

  @IsOptional()
  @IsBoolean()
  showAxis?: boolean;

  @IsOptional()
  @IsBoolean()
  animations?: boolean;

  @IsOptional()
  @IsBoolean()
  showDataLabel?: boolean;

  @IsOptional()
  @IsBoolean()
  format?: boolean;

  @IsOptional()
  @IsBoolean()
  gradient?: boolean;

  @IsOptional()
  @IsBoolean()
  legend?: boolean;

  @IsOptional()
  @IsString()
  legendTitle?: string;

  @IsOptional()
  @IsBoolean()
  tooltipDisabled?: boolean;

  @IsOptional()
  @IsBoolean()
  roundEdges?: boolean;

  @IsOptional()
  @IsBoolean()
  roundDomains?: boolean;

  @IsOptional()
  @IsBoolean()
  showGridLines?: boolean;

  @IsOptional()
  @IsBoolean()
  timeline?: boolean;

  @IsOptional()
  @IsEnum(enums.ChartInterpolationEnum)
  interpolation?: enums.ChartInterpolationEnum;

  @IsOptional()
  @IsBoolean()
  autoScale?: boolean;

  @IsOptional()
  @IsBoolean()
  doughnut?: boolean;

  @IsOptional()
  @IsBoolean()
  explodeSlices?: boolean;

  @IsOptional()
  @IsBoolean()
  labels?: boolean;

  @IsOptional()
  @IsEnum(enums.ChartColorSchemeEnum)
  colorScheme?: enums.ChartColorSchemeEnum;

  @IsOptional()
  @IsEnum(enums.ChartSchemeTypeEnum)
  schemeType?: enums.ChartSchemeTypeEnum;

  @IsOptional()
  @IsInt()
  pageSize?: number;

  @IsOptional()
  @IsNumber()
  arcWidth?: number;

  @IsOptional()
  @IsInt()
  barPadding?: number;

  @IsOptional()
  @IsInt()
  groupPadding?: number;

  @IsOptional()
  @IsInt()
  innerPadding?: number;

  @IsOptional() // absent in docs
  @IsNumber()
  rangeFillOpacity?: number;

  @IsOptional()
  @IsInt()
  angleSpan?: number;

  @IsOptional()
  @IsInt()
  startAngle?: number;

  @IsOptional()
  @IsInt()
  bigSegments?: number;

  @IsOptional()
  @IsInt()
  smallSegments?: number;

  @IsOptional()
  @IsInt()
  min?: number;

  @IsOptional()
  @IsInt()
  max?: number;

  @IsOptional()
  @IsString()
  units?: string;

  @IsOptional()
  @IsNumber()
  yScaleMin?: number;

  @IsOptional()
  @IsNumber()
  yScaleMax?: number;

  @IsOptional()
  @IsNumber()
  xScaleMax?: number;

  @IsOptional()
  @IsString()
  bandColor?: string;

  @IsOptional()
  @IsString()
  cardColor?: string;

  @IsOptional()
  @IsString()
  textColor?: string;

  @IsOptional()
  @IsString()
  emptyColor?: string;

  @IsOptional()
  @IsString()
  formatNumberDataLabel?: string;

  @IsOptional()
  @IsString()
  formatNumberValue?: string;

  @IsOptional()
  @IsString()
  formatNumberAxisTick?: string;

  @IsOptional()
  @IsString()
  formatNumberYAxisTick?: string;

  @IsOptional()
  @IsString()
  formatNumberXAxisTick?: string;

  @IsOptional()
  @IsInt()
  tileWidth?: number;

  @IsOptional()
  @IsInt()
  tileHeight?: number;

  @IsOptional()
  @IsInt()
  tileX?: number;

  @IsOptional()
  @IsInt()
  tileY?: number;
}
