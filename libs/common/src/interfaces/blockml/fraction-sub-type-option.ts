import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FractionLogicEnum } from '~common/enums/fraction/fraction-logic.enum';

export class FractionSubTypeOption {
  @IsOptional()
  @IsEnum(FractionLogicEnum)
  logicGroup: FractionLogicEnum;

  @IsString()
  typeValue: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  label: string;
}
