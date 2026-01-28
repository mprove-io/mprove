import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { Fraction } from './fraction';

export class ReportField {
  @IsString()
  id: string;

  @IsBoolean()
  hidden: boolean;

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ValidateNested()
  @Type(() => Fraction)
  fractions: Fraction[];

  @IsOptional()
  @IsNumber()
  maxFractions: number;

  @IsOptional()
  @IsEnum(FieldResultEnum)
  result: FieldResultEnum;

  @IsOptional()
  @IsString()
  suggestModelDimension: string;

  @IsOptional()
  @IsString()
  storeModel: string;

  @IsOptional()
  @IsString()
  storeResult: string;

  @IsOptional()
  @IsString()
  storeFilter: string;
}
