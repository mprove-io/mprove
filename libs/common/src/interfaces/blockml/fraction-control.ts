import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { enums } from '~common/barrels/enums';
import { FractionControlOption } from './fraction-control-option';

export class FractionControl {
  @ValidateNested()
  @Type(() => FractionControlOption)
  options: FractionControlOption[];

  @IsOptional()
  value: any;

  @IsOptional()
  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  required: string;

  @IsString()
  name: string;

  @IsEnum(enums.ControlClassEnum)
  controlClass: enums.ControlClassEnum;

  @IsOptional()
  isMetricsDate: boolean;
}
