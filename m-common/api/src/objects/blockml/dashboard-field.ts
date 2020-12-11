import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import * as apiEnums from '../../enums/_index';
import { Fraction } from './fraction';

export class DashboardField {
  @IsString()
  id: string;

  @IsBoolean()
  hidden: boolean;

  @IsString()
  label: string;

  @IsEnum(apiEnums.FieldAnyResultEnum)
  result: apiEnums.FieldAnyResultEnum;

  @ValidateNested()
  @Type(() => Fraction)
  fractions: Fraction[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  fromField?: string;
}
