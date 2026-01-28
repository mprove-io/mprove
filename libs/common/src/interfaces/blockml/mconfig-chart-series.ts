import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';

export class MconfigChartSeries {
  @IsOptional()
  @IsString()
  dataField?: string;

  @IsOptional()
  @IsString()
  dataRowId?: string;

  @IsEnum(ChartTypeEnum)
  type?: ChartTypeEnum;

  @IsOptional()
  @IsInt()
  yAxisIndex?: number;
}
