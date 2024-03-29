import { common } from '~blockml/barrels/common';

export interface Filter {
  hidden?: string; // boolean
  hidden_line_num?: number;

  label?: string;
  label_line_num?: number;

  description?: string;
  description_line_num?: number;

  // sql?: string;
  // sql_line_num?: number;

  result?: common.FieldResultEnum;
  result_line_num?: number;

  default?: string[];
  default_line_num?: number;

  //

  name?: string;

  name_line_num?: number;

  fieldClass?: common.FieldClassEnum;

  fractions?: common.Fraction[];
}
