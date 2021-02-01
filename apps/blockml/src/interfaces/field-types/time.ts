import { api } from '~blockml/barrels/api';
import { enums } from '~blockml/barrels/enums';

export interface Time {
  hidden?: string; // boolean
  hidden_line_num?: number;

  group_label?: string;
  group_label_line_num?: number;

  group_description?: string;
  group_description_line_num?: number;

  sql?: string;
  sql_line_num?: number;

  source?: enums.TimeSourceEnum;
  source_line_num?: number;

  unnest?: string;
  unnest_line_num?: number;

  timeframes?: enums.TimeframeEnum[];
  timeframes_line_num?: number;

  //

  name?: string;

  name_line_num?: number;

  fieldClass?: api.FieldClassEnum;
}
