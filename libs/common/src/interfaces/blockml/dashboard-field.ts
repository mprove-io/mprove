import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { FieldResultEnum } from '~common/enums/field-result.enum';
import { Fraction } from './fraction';

export class DashboardField {
  @IsString()
  id: string;

  @IsBoolean()
  hidden: boolean;

  @IsOptional()
  @IsNumber()
  maxFractions: number;

  @IsString()
  label: string;

  @IsOptional()
  @IsEnum(FieldResultEnum)
  result: FieldResultEnum;

  @IsOptional()
  @IsString()
  storeModel: string;

  @IsOptional()
  @IsString()
  storeResult: string;

  @IsOptional()
  @IsString()
  storeFilter: string;

  @IsOptional()
  @IsString()
  suggestModelDimension: string;

  @ValidateNested()
  @Type(() => Fraction)
  fractions: Fraction[];

  @IsOptional()
  @IsString()
  description?: string;
}
