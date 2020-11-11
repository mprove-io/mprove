import { enums } from '../../barrels/enums';
import { Field } from '../field/field';

export interface Dimension extends Field {
  label: string;
  label_line_num: number;

  type: enums.FieldExtTypeEnum;
  type_line_num: number;

  result: enums.FieldExtResultEnum;
  result_line_num: number;

  unnest: string;
  unnest_line_num: number;

  format_number: string;
  format_number_line_num: number;

  currency_prefix: string;
  currency_prefix_line_num: number;

  currency_suffix: string;
  currency_suffix_line_num: number;

  //

  group_id: string;

  sql_timestamp: string;

  sql_timestamp_name: string;

  sql_timestamp_real: string;
}
