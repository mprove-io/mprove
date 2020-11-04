import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Fraction } from './fraction';

export class Filter {
  @IsString()
  fieldId: string;

  @ValidateNested()
  @Type(() => Fraction)
  fractions: Fraction[];
}
