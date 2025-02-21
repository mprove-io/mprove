import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { enums } from '~common/barrels/enums';
import { FractionControlOption } from './fraction-control-option';
import { ShowIfDepIncludingParentFilter } from './show-if-dep-including-parent-filter';

export class FractionControl {
  @ValidateNested()
  @Type(() => FractionControlOption)
  options: FractionControlOption[];

  @IsOptional()
  @IsString()
  value: any;

  @IsOptional()
  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  showIf: string;

  @IsOptional()
  @IsString()
  required: string;

  @IsString()
  name: string;

  @IsEnum(enums.ControlClassEnum)
  controlClass: enums.ControlClassEnum;

  @ValidateNested()
  @Type(() => FractionControlOption)
  showIfDepsIncludingParentFilter: ShowIfDepIncludingParentFilter[];
}
