import { api } from '../../barrels/api';

export interface Dimension {
  hidden?: string; // boolean
  hidden_line_num?: number;

  label?: string;
  label_line_num?: number;

  description?: string;
  description_line_num?: number;

  sql?: string;
  sql_line_num?: number;

  type?: api.FieldTypeEnum;
  type_line_num?: number;

  result?: api.FieldResultEnum;
  result_line_num?: number;

  unnest?: string;
  unnest_line_num?: number;

  format_number?: string;
  format_number_line_num?: number;

  currency_prefix?: string;
  currency_prefix_line_num?: number;

  currency_suffix?: string;
  currency_suffix_line_num?: number;

  // from time

  group_label?: string;
  group_label_line_num?: number;

  group_description?: string;
  group_description_line_num?: number;

  //

  name?: string;

  name_line_num?: number;

  fieldClass?: api.FieldClassEnum;

  sqlReal?: string;

  sqlTimestampReal?: string;

  sqlTimestampName?: string;

  sqlTimestamp?: string;

  groupId?: string;
}
