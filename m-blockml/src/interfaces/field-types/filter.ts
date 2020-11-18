import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';

export interface Filter {
  hidden?: string; // boolean
  hidden_line_num?: number;

  label?: string;
  label_line_num?: number;

  description?: string;
  description_line_num?: number;

  // sql?: string;
  // sql_line_num?: number;

  result?: enums.FieldAnyResultEnum;
  result_line_num?: number;

  default?: string[];
  default_line_num?: number;

  //

  name?: string;

  name_line_num?: number;

  fieldClass?: enums.FieldClassEnum;

  fractions?: api.Fraction[];
}
