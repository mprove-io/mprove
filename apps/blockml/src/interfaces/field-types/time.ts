import { common } from '~blockml/barrels/common';

export interface Time {
  hidden?: string; // boolean
  hidden_line_num?: number;

  group_label?: string;
  group_label_line_num?: number;

  group_description?: string;
  group_description_line_num?: number;

  sql?: string;
  sql_line_num?: number;

  source?: common.TimeSourceEnum;
  source_line_num?: number;

  unnest?: string;
  unnest_line_num?: number;

  timeframes?: common.TimeframeEnum[];
  timeframes_line_num?: number;

  //

  name?: string;

  name_line_num?: number;

  fieldClass?: common.FieldClassEnum;
}
