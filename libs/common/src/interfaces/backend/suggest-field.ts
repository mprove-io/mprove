import { IsEnum, IsString } from 'class-validator';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FieldResultEnum } from '~common/enums/field-result.enum';

export class SuggestField {
  @IsString()
  modelFieldRef: string;

  @IsEnum(ConnectionTypeEnum)
  connectionType: ConnectionTypeEnum;

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
