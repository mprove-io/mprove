import { Filter } from '../blockml/filter';
import { Fraction } from '../blockml/fraction';
import { ModelFieldX } from './model-field-x';

export class FilterX extends Filter {
  fractions: Fraction[];
  field: ModelFieldX;
}
