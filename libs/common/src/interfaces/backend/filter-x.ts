import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Filter } from '../blockml/filter';
import { Fraction } from '../blockml/fraction';
import { ModelFieldX } from './model-field-x';

export class FilterX extends Filter {
  @ValidateNested()
  @Type(() => Fraction)
  fractions: Fraction[];

  @ValidateNested()
  @Type(() => ModelFieldX)
  field: ModelFieldX;
}
