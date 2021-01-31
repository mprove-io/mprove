import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';
import * as apiEnums from '~api/enums/_index';

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

  @IsEnum(apiEnums.ChartTypeEnum)
  type: apiEnums.ChartTypeEnum;

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

  @IsEnum(apiEnums.ChartInterpolationEnum)
  interpolation: apiEnums.ChartInterpolationEnum;

  @IsBoolean()
  autoScale: boolean;

  @IsBoolean()
  doughnut: boolean;

  @IsBoolean()
  explodeSlices: boolean;

  @IsBoolean()
  labels: boolean;

  @IsEnum(apiEnums.ChartColorSchemeEnum)
  colorScheme: apiEnums.ChartColorSchemeEnum;

  @IsEnum(apiEnums.ChartSchemeTypeEnum)
  schemeType: apiEnums.ChartSchemeTypeEnum;

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

  @IsEnum(apiEnums.ChartTileWidthEnum)
  tileWidth: apiEnums.ChartTileWidthEnum;

  @IsEnum(apiEnums.ChartTileHeightEnum)
  tileHeight: apiEnums.ChartTileHeightEnum;

  @IsEnum(apiEnums.ChartViewSizeEnum)
  viewSize: apiEnums.ChartViewSizeEnum;

  @IsInt()
  viewWidth: number;

  @IsInt()
  viewHeight: number;
}
