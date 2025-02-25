import { IsEnum, IsOptional, IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

export class FractionSubTypeOption {
  @IsOptional()
  @IsEnum(enums.FractionLogicEnum)
  logicGroup: enums.FractionLogicEnum;

  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  label: string;
}
