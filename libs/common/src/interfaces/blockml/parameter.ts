import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

export class Parameter {
  @IsString()
  parameterId: string;

  @IsEnum(enums.ParameterTypeEnum)
  parameterType: enums.ParameterTypeEnum;

  @IsString()
  filter: string;

  @IsEnum(enums.FieldResultEnum)
  result: enums.FieldResultEnum;

  @IsString({ each: true })
  conditions: string[];

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
