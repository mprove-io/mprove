import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

export class MconfigChartSeries {
  @IsOptional()
  @IsString()
  dataField?: string;

  @IsOptional()
  @IsString()
  dataRowId?: string;

  @IsEnum(enums.ChartTypeEnum)
  type?: enums.ChartTypeEnum;

  @IsOptional()
  @IsInt()
  yAxisIndex?: number;
}
