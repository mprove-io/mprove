import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { enums } from '~api/barrels/enums';

export class ModelField {
  @IsString()
  id: string;

  @IsBoolean()
  hidden: boolean;

  @IsString()
  label: string;

  @IsEnum(enums.FieldClassEnum)
  fieldClass: enums.FieldClassEnum;

  @IsEnum(enums.FieldResultEnum)
  result: enums.FieldResultEnum;

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
  @IsEnum(enums.FieldTypeEnum)
  type?: enums.FieldTypeEnum;

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
