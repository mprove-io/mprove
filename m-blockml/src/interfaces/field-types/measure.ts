import { enums } from '../../barrels/enums';
import { Field } from '../field/field';

export interface Measure extends Field {
  label: string;
  label_line_num: number;

  type: enums.FieldExtTypeEnum;
  type_line_num: number;

  result: enums.FieldExtResultEnum;
  result_line_num: number;

  format_number: string;
  format_number_line_num: number;

  currency_prefix: string;
  currency_prefix_line_num: number;

  currency_suffix: string;
  currency_suffix_line_num: number;

  sql_key: string;
  sql_key_line_num: number;

  percentile: string; // number
  percentile_line_num: number;

  //

  sqlKeyReal: string;
}
