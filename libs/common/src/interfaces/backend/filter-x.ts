import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Filter } from '../blockml/filter';
import { Fraction } from '../blockml/fraction';
import { MconfigField } from './mconfig-field';

export class FilterX extends Filter {
  @ValidateNested()
  @Type(() => Fraction)
  fractions: Fraction[];

  @ValidateNested()
  @Type(() => MconfigField)
  field: MconfigField;
}
