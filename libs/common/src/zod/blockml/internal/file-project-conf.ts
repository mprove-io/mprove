import { z } from 'zod';
import { ProjectWeekStartEnum } from '#common/enums/project-week-start.enum';
import { zFileBasic } from '#common/zod/blockml/internal/file-basic';

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

export type FileProjectConf = z.infer<typeof zFileProjectConf>;
