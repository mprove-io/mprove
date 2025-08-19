import { IsEnum, IsString } from 'class-validator';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FieldResultEnum } from '~common/enums/field-result.enum';

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

  @IsEnum(FieldClassEnum)
  fieldClass: FieldClassEnum;

  @IsEnum(FieldResultEnum)
  result: FieldResultEnum;
}
