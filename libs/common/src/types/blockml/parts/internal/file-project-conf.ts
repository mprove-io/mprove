import { z } from 'zod';
import { ProjectWeekStartEnum } from '#common/enums/project-week-start.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FileBasic,
  zFileBasic
} from '#common/types/blockml/parts/internal/file-basic';
import type { EnumValues } from '#common/types/enum-values';
import type { Extend } from '#common/types/extend';

export type FileProjectConf = Extend<
  FileBasic,
  {
    mprove_dir?: string;
    mprove_dir_line_num?: number;
    case_sensitive_string_filters?: string;
    case_sensitive_string_filters_line_num?: number;
    week_start?: EnumValues<typeof ProjectWeekStartEnum>;
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

export let zFileProjectConf = zFileBasic
  .extend({
    mprove_dir: z.string().nullish(),
    mprove_dir_line_num: z.number().nullish(),
    case_sensitive_string_filters: z.string().nullish(),
    case_sensitive_string_filters_line_num: z.number().nullish(),
    week_start: z.enum(ProjectWeekStartEnum).nullish(),
    week_start_line_num: z.number().nullish(),
    default_timezone: z.string().nullish(),
    default_timezone_line_num: z.number().nullish(),
    allow_timezones: z.string().nullish(),
    allow_timezones_line_num: z.number().nullish(),
    format_number: z.string().nullish(),
    format_number_line_num: z.number().nullish(),
    currency_prefix: z.string().nullish(),
    currency_prefix_line_num: z.number().nullish(),
    currency_suffix: z.string().nullish(),
    currency_suffix_line_num: z.number().nullish(),
    thousands_separator: z.string().nullish(),
    thousands_separator_line_num: z.number().nullish()
  })
  .meta({ id: 'FileProjectConf' });

assertTypesEqual<FileProjectConf, z.infer<typeof zFileProjectConf>>({
  value: true
});
