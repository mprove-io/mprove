import { FieldClassEnum } from '~common/enums/field-class.enum';
import { TimeSourceEnum } from '~common/enums/time-source.enum';
import { TimeframeEnum } from '~common/enums/timeframe.enum';

export interface FieldTime {
  hidden?: string; // boolean
  hidden_line_num?: number;

  group_label?: string;
  group_label_line_num?: number;

  group_description?: string;
  group_description_line_num?: number;

  sql?: string;
  sql_line_num?: number;

  source?: TimeSourceEnum;
  source_line_num?: number;

  unnest?: string;
  unnest_line_num?: number;

  timeframes?: TimeframeEnum[];
  timeframes_line_num?: number;

  //

  name?: string;

  name_line_num?: number;

  fieldClass?: FieldClassEnum;
}
