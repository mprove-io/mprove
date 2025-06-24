import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';
import { enums } from '~common/barrels/enums';

export class ModelField {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  malloyFieldName?: string;

  @IsOptional()
  @IsString({ each: true })
  malloyFieldPath?: string[];

  @IsBoolean()
  hidden: boolean;

  @IsBoolean()
  required: boolean;

  @IsOptional()
  @IsNumber()
  maxFractions: number;

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
