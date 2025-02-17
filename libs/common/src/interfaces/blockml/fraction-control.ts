import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '~common/barrels/enums';
import { FractionControlOption } from './fraction-control-option';

export class FractionControl {
  @IsString()
  input: string;

  @IsString()
  switch: string;

  @IsString()
  datePicker: string;

  @IsString()
  selector: string;

  @ValidateNested()
  @Type(() => FractionControlOption)
  options: FractionControlOption[];

  @IsString()
  value: any;

  @IsString()
  label: string;

  @IsBoolean()
  isArray: boolean;

  @IsString()
  showIf: string;

  @IsString()
  required: string;

  @IsString()
  name: string;

  @IsEnum(enums.ControlClassEnum)
  controlClass: enums.ControlClassEnum;

  @IsString()
  showIfDepsIncludingParentFilter: {
    filterName: string;
    controlName: string;
    value: any;
  }[];
}
