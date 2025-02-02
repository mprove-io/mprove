import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { enums } from '~common/barrels/enums';
import { Filter } from './filter';

export class ModelMetric {
  @IsString()
  modelId?: string;

  @IsString()
  fieldId?: string;

  @IsEnum(enums.FieldClassEnum)
  fieldClass?: enums.FieldClassEnum;

  @IsString()
  timeFieldId?: string;

  @ValidateNested()
  @Type(() => Filter)
  params?: Filter[];

  @IsString()
  formula?: string;

  @IsString()
  connection?: string;

  @IsString()
  sql?: string;

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
