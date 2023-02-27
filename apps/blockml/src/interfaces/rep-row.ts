import { common } from '~blockml/barrels/common';

export interface RepRow {
  id?: string;
  id_line_num?: number;

  name?: string;
  name_line_num?: number;

  type?: common.RowTypeEnum;
  type_line_num?: number;

  metric?: string;
  metric_line_num?: number;

  params?: any[];
  params_line_num?: number;

  formula?: string;
  formula_line_num?: number;

  show_chart?: string; // boolean
  show_chart_line_num?: number;

  format_number?: string;
  format_number_line_num?: number;

  currency_prefix?: string;
  currency_prefix_line_num?: number;

  currency_suffix?: string;
  currency_suffix_line_num?: number;
}
