import { enums } from '../../barrels/enums';
import { Field } from '../field/field';

export interface Calculation extends Field {
  label: string;
  label_line_num: number;

  result: enums.FieldExtResultEnum;
  result_line_num: number;

  format_number: string;
  format_number_line_num: number;

  currency_prefix: string;
  currency_prefix_line_num: number;

  currency_suffix: string;
  currency_suffix_line_num: number;

  //

  prepForceDims: {
    [dim: string]: number;
  };
  forceDims: {
    [as: string]: {
      [dim: string]: number;
    };
  };
}
