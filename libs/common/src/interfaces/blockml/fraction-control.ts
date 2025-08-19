import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ControlClassEnum } from '~common/enums/control-class.enum';
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

  @IsEnum(ControlClassEnum)
  controlClass: ControlClassEnum;

  @IsOptional()
  isMetricsDate: boolean;
}
