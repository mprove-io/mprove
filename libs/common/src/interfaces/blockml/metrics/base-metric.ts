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
  partNodeLabel?: string;

  @IsString()
  partFieldLabel?: string;

  @IsString()
  partLabel?: string;

  @IsString()
  timeNodeLabel?: string;

  @IsString()
  timeFieldLabel?: string;

  @IsString()
  timeLabel?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  formatNumber?: string;

  @IsOptional()
  @IsString()
  currencyPrefix?: string;

  @IsOptional()
  @IsString()
  currencySuffix?: string;

  @IsInt()
  serverTs?: number;
}
