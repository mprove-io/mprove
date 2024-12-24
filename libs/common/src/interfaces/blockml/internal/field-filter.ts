import { enums } from '~common/barrels/enums';
import { Fraction } from '../fraction';

export interface FieldFilter {
  hidden?: string; // boolean
  hidden_line_num?: number;

  label?: string;
  label_line_num?: number;

  description?: string;
  description_line_num?: number;

  // sql?: string;
  // sql_line_num?: number;

  result?: enums.FieldResultEnum;
  result_line_num?: number;

  suggest_model_dimension?: string;
  suggest_model_dimension_line_num?: number;

  conditions?: string[];
  conditions_line_num?: number;

  //

  name?: string;

  name_line_num?: number;

  fieldClass?: enums.FieldClassEnum;

  fractions?: Fraction[];
}
