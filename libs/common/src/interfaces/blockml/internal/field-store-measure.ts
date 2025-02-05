import { enums } from '~common/barrels/enums';

export interface FieldStoreMeasure {
  label?: string;
  label_line_num?: number;

  description?: string;
  description_line_num?: number;

  result?: enums.FieldResultEnum; // string
  result_line_num?: number;

  format_number?: string;
  format_number_line_num?: number;

  currency_prefix?: string;
  currency_prefix_line_num?: number;

  currency_suffix?: string;
  currency_suffix_line_num?: number;

  group?: string;
  group_line_num?: number;

  show_if?: string; // boolean
  show_if_line_num?: number;

  required?: string; // boolean
  required_line_num?: number;

  meta?: string;
  meta_line_num?: number;

  //

  name?: string;

  name_line_num?: number;

  fieldClass?: enums.FieldClassEnum;
}
