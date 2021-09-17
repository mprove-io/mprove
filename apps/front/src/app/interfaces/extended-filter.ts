import { common } from '~front/barrels/common';
import { ColumnField } from './column-field';

export class FilterExtended extends common.Filter {
  fractions: common.Fraction[];
  field: ColumnField;
}
