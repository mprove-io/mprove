import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

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
  @IsString()
  detail?: enums.DetailUnitEnum;
}
