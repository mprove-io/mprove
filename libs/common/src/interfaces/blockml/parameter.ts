import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { enums } from '~common/barrels/enums';
import { Fraction } from './fraction';

export class Parameter {
  @IsString()
  parameterId: string;

  @IsString()
  topParId: string;

  @IsEnum(enums.ParameterTypeEnum)
  parameterType: enums.ParameterTypeEnum;

  @IsString()
  apply_to: string;

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

  @IsString({ each: true })
  conditions: string[];

  @ValidateNested()
  @Type(() => Fraction)
  fractions: Fraction[];

  @IsString()
  formula: string;

  @IsString()
  listen: string;

  @IsString({ each: true })
  xDeps: string[];

  @IsBoolean()
  isJsonValid?: boolean;

  @IsBoolean()
  isSchemaValid?: boolean;

  @IsString()
  schemaError?: string;
}
