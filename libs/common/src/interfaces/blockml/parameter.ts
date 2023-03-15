import { IsEnum, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

export class Parameter {
  @IsString()
  parameterId: string;

  @IsEnum(enums.ParameterTypeEnum)
  parameterType: enums.ParameterTypeEnum;

  @IsString()
  fieldId: string;

  @IsEnum(enums.FieldResultEnum)
  result: enums.FieldResultEnum;

  @IsString()
  formula: string;

  @IsString({ each: true })
  conditions: string[];

  @IsString()
  value: string;
}
