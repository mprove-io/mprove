import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FieldResultEnum } from '~common/enums/field-result.enum';
import { MetricTypeEnum } from '~common/enums/metric-type.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';

export class ModelMetric {
  @IsString()
  modelId?: string;

  @IsEnum(ModelTypeEnum)
  modelType: ModelTypeEnum;

  @IsString()
  fieldId?: string;

  @IsEnum(FieldClassEnum)
  fieldClass?: FieldClassEnum;

  @IsOptional()
  @IsEnum(FieldResultEnum)
  fieldResult?: FieldResultEnum;

  @IsString()
  timeFieldId?: string;

  @IsString()
  connection?: string;

  @IsString()
  structId?: string;

  @IsString()
  filePath?: string;

  @IsEnum(MetricTypeEnum)
  type?: MetricTypeEnum;

  @IsString()
  metricId?: string;

  @IsString()
  topNode?: string;

  // @IsString()
  // partId?: string;

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
