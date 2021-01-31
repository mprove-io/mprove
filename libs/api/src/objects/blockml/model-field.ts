import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import * as apiEnums from '~api/enums/_index';

export class ModelField {
  @IsString()
  id: string;

  @IsBoolean()
  hidden: boolean;

  @IsString()
  label: string;

  @IsEnum(apiEnums.FieldClassEnum)
  fieldClass: apiEnums.FieldClassEnum;

  @IsEnum(apiEnums.FieldResultEnum)
  result: apiEnums.FieldResultEnum;

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
  @IsEnum(apiEnums.FieldTypeEnum)
  type?: apiEnums.FieldTypeEnum;

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
