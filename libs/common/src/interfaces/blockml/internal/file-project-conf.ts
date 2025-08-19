import { ProjectWeekStartEnum } from '~common/enums/project-week-start.enum';
import { FileBasic } from './file-basic';

export interface FileProjectConf extends FileBasic {
  mprove_dir?: string;
  mprove_dir_line_num?: number;

  case_sensitive_string_filters?: string; // boolean
  case_sensitive_string_filters_line_num?: number;

  simplify_safe_aggregates?: string; // boolean
  simplify_safe_aggregates_line_num?: number;

  week_start?: ProjectWeekStartEnum;
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

  thousands_separator?: string;
  thousands_separator_line_num?: number;
}
