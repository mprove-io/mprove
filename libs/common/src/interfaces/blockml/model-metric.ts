import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FieldResultEnum } from '~common/enums/field-result.enum';
import { MetricTypeEnum } from '~common/enums/metric-type.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';

export class ModelMetric {
  @IsString()
  modelId?: string;

  @IsEnum(ModelTypeEnum)
  modelType: ModelTypeEnum;

  @IsEnum(ConnectionTypeEnum)
  connectionType: ConnectionTypeEnum;

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
  structId?: string;

  @IsOptional()
  @IsString()
  filePath?: string;

  @IsOptional()
  @IsInt()
  fieldLineNum?: number;

  @IsEnum(MetricTypeEnum)
  type?: MetricTypeEnum;

  @IsString()
  metricId?: string;

  @IsOptional()
  @IsString()
  topNode?: string;

  // @IsString()
  // partId?: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  topLabel?: string;

  @IsOptional()
  @IsString()
  partNodeLabel?: string;

  @IsOptional()
  @IsString()
  partFieldLabel?: string;

  @IsOptional()
  @IsString()
  partLabel?: string;

  @IsOptional()
  @IsString()
  timeNodeLabel?: string;

  @IsOptional()
  @IsString()
  timeFieldLabel?: string;

  @IsOptional()
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
