import { IsEnum, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

export class SuggestField {
  @IsString()
  modelFieldRef: string;

  @IsString()
  topLabel: string;

  @IsString()
  partNodeLabel: string;

  @IsString()
  partFieldLabel: string;

  @IsString()
  partLabel: string;

  @IsEnum(enums.FieldClassEnum)
  fieldClass: enums.FieldClassEnum;

  @IsEnum(enums.FieldResultEnum)
  result: enums.FieldResultEnum;
}
