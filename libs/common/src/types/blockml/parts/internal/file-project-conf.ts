import type { ProjectWeekStart } from '#common/types/backend/parts/project/project-week-start';

import type { FileBasic } from '#common/types/blockml/parts/internal/file/file-basic';

import type { Extend } from '#common/types/extend';

export type FileProjectConf = Extend<
  FileBasic,
  {
    mprove_dir?: string;
    mprove_dir_line_num?: number;
    case_sensitive_string_filters?: string;
    case_sensitive_string_filters_line_num?: number;
    week_start?: ProjectWeekStart;
    week_start_line_num?: number;
    default_timezone?: string;
    default_timezone_line_num?: number;
    allow_timezones?: string;
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
>;
