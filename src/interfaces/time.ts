import { enums } from '../barrels/enums';
import { Field } from './field';

export interface Time extends Field {
  group_label: string;
  group_label_line_num: number;

  group_description: string;
  group_description_line_num: number;

  source: enums.TimeSourceEnum;
  source_line_num: number;
  unnest: string;
  unnest_line_num: number;
  timeframes: enums.TimeframeEnum[];
  timeframes_line_num: number;
}
