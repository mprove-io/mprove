import { common } from '~blockml/barrels/common';

export interface ProjectConf extends common.FileBasic {
  mprove_dir?: string;
  mprove_dir_line_num?: number;

  week_start?: common.ProjectWeekStartEnum;
  week_start_line_num?: number;

  default_timezone?: string;
  default_timezone_line_num?: number;

  allow_timezones?: string; // boolean
  allow_timezones_line_num?: number;

  format_number?: string;
  format_number_line_num?: number;

  currency_prefix?: string;
  currency_prefix_line_num?: number;

  currency_suffix?: string;
  currency_suffix_line_num?: number;
}
