import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { DetailUnitEnum } from '~common/enums/detail-unit.enum';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FieldResultEnum } from '~common/enums/field-result.enum';
import { FieldTypeEnum } from '~common/enums/field-type.enum';
import { KeyValuePair } from './key-value-pair';

export class ModelField {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  malloyFieldName?: string;

  // fieldItem -> annotations duration.terse

  @IsOptional()
  @IsString({ each: true })
  malloyFieldPath?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => KeyValuePair)
  malloyTags?: KeyValuePair[];

  @IsOptional()
  @ValidateNested()
  @Type(() => KeyValuePair)
  mproveTags?: KeyValuePair[];

  @IsBoolean()
  hidden: boolean;

  @IsBoolean()
  required: boolean;

  @IsOptional()
  @IsNumber()
  maxFractions: number;

  @IsString()
  label: string;

  @IsEnum(FieldClassEnum)
  fieldClass: FieldClassEnum;

  @IsEnum(FieldResultEnum)
  result: FieldResultEnum;

  @IsOptional()
  @IsString()
  suggestModelDimension: string;

  @IsString()
  sqlName: string;

  @IsString()
  topId: string;

  @IsString()
  topLabel: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(FieldTypeEnum)
  type?: FieldTypeEnum;

  @IsOptional()
  @IsString()
  groupId?: string;

  @IsOptional()
  @IsString()
  groupLabel?: string;

  @IsOptional()
  @IsString()
  groupDescription?: string;

  @IsOptional()
  @IsString()
  formatNumber?: string;

  @IsOptional()
  @IsString()
  currencyPrefix?: string;

  @IsOptional()
  @IsString()
  currencySuffix?: string;

  @IsOptional()
  @IsBoolean()
  buildMetrics?: boolean;

  @IsOptional()
  @IsString()
  timeframe?: string;

  @IsOptional()
  @IsString()
  detail?: DetailUnitEnum;
}
