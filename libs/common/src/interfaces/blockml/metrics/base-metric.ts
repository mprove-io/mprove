import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

export class BaseMetric {
  @IsString()
  structId?: string;

  @IsString()
  filePath?: string;

  @IsEnum(enums.MetricTypeEnum)
  type?: enums.MetricTypeEnum;

  @IsString()
  metricId?: string;

  @IsString()
  topNode?: string;

  @IsString()
  partId?: string;

  @IsString()
  label?: string;

  @IsString()
  topLabel?: string;

  @IsString()
  partLabel?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  serverTs?: number;
}
