import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import * as apiEnums from '../../enums/_index';

export class ModelField {
  @IsString()
  id: string;

  @IsBoolean()
  hidden: boolean;

  @IsString()
  label: string;

  @IsEnum(apiEnums.ModelFieldFieldClassEnum)
  fieldClass: apiEnums.ModelFieldFieldClassEnum;

  @IsEnum(apiEnums.ModelFieldResultEnum)
  result: apiEnums.ModelFieldResultEnum;

  @IsString()
  sqlName: string;

  @IsString()
  topId: string;

  @IsString()
  topLabel: string;

  @IsString({ each: true })
  forceDims: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(apiEnums.ModelFieldTypeEnum)
  type?: apiEnums.ModelFieldTypeEnum;

  @IsOptional()
  @IsString()
  groupId?: string;

  @IsOptional()
  @IsString()
  groupLabel?: string;

  @IsOptional()
  @IsString()
  groupDescription?: string;

  @IsString()
  formatNumber: string;

  @IsString()
  currencyPrefix: string;

  @IsString()
  currencySuffix: string;
}
