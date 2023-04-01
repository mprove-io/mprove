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

  @IsString()
  formula: string;

  formulaDeps: string[];

  @IsBoolean()
  isCalcValid?: boolean;

  @IsString({ each: true })
  conditions: string[];

  @IsString()
  value: string;
}
