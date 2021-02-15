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
  @IsString()
  chartId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  isValid: boolean;

  @IsEnum(enums.ChartTypeEnum)
  type: enums.ChartTypeEnum;

  @IsString()
  xField: string;

  @IsString()
  yField: string;

  @IsString({ each: true })
  yFields: string[];

  @IsString({ each: true })
  hideColumns: string[];

  @IsString()
  multiField: string;

  @IsString()
  valueField: string;

  @IsString()
  previousValueField: string;

  @IsBoolean()
  xAxis: boolean;

  @IsBoolean()
  showXAxisLabel: boolean;

  @IsString()
  xAxisLabel: string;

  @IsBoolean()
  yAxis: boolean;

  @IsBoolean()
  showYAxisLabel: boolean;

  @IsString()
  yAxisLabel: string;

  @IsBoolean()
  showAxis: boolean;

  @IsBoolean()
  animations: boolean;

  @IsBoolean()
  gradient: boolean;

  @IsBoolean()
  legend: boolean;

  @IsString()
  legendTitle: string;

  @IsBoolean()
  tooltipDisabled: boolean;

  @IsBoolean()
  roundEdges: boolean;

  @IsBoolean()
  roundDomains: boolean;

  @IsBoolean()
  showGridLines: boolean;

  @IsBoolean()
  timeline: boolean;

  @IsEnum(enums.ChartInterpolationEnum)
  interpolation: enums.ChartInterpolationEnum;

  @IsBoolean()
  autoScale: boolean;

  @IsBoolean()
  doughnut: boolean;

  @IsBoolean()
  explodeSlices: boolean;

  @IsBoolean()
  labels: boolean;

  @IsEnum(enums.ChartColorSchemeEnum)
  colorScheme: enums.ChartColorSchemeEnum;

  @IsEnum(enums.ChartSchemeTypeEnum)
  schemeType: enums.ChartSchemeTypeEnum;

  @IsInt()
  pageSize: number;

  @IsNumber()
  arcWidth: number;

  @IsInt()
  barPadding: number;

  @IsInt()
  groupPadding: number;

  @IsInt()
  innerPadding: number;

  // absent in docs
  @IsNumber()
  rangeFillOpacity: number;

  @IsInt()
  angleSpan: number;

  @IsInt()
  startAngle: number;

  @IsInt()
  bigSegments: number;

  @IsInt()
  smallSegments: number;

  @IsInt()
  min: number;

  @IsInt()
  max: number;

  @IsString()
  units: string;

  @IsNumber()
  yScaleMin: number;

  @IsNumber()
  yScaleMax: number;

  @IsNumber()
  xScaleMax: number;

  @IsString()
  bandColor: string;

  @IsString()
  cardColor: string;

  @IsString()
  textColor: string;

  @IsString()
  emptyColor: string;

  @IsEnum(enums.ChartTileWidthEnum)
  tileWidth: enums.ChartTileWidthEnum;

  @IsEnum(enums.ChartTileHeightEnum)
  tileHeight: enums.ChartTileHeightEnum;

  @IsEnum(enums.ChartViewSizeEnum)
  viewSize: enums.ChartViewSizeEnum;

  @IsInt()
  viewWidth: number;

  @IsInt()
  viewHeight: number;
}
