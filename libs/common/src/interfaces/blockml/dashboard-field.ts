import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { enums } from '~common/barrels/enums';
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
  @IsEnum(enums.FieldResultEnum)
  result: enums.FieldResultEnum;

  @IsOptional()
  @IsString()
  store: string;

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
