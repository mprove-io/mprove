import { z } from 'zod';
import { ProjectWeekStartEnum } from '#common/enums/project-week-start.enum';
import { zTimezone } from '#common/zod/z-timezone';

export let zMproveConfig = z
  .object({
    mproveDirValue: z.string().nullish(),
    caseSensitiveStringFilters: z.boolean().nullish(),
    weekStart: z.enum(ProjectWeekStartEnum).nullish(),
    allowTimezones: z.boolean().nullish(),
    defaultTimezone: zTimezone.nullish(),
    formatNumber: z.string().nullish(),
    currencyPrefix: z.string().nullish(),
    currencySuffix: z.string().nullish(),
    thousandsSeparator: z.string().nullish()
  })
  .meta({ id: 'MproveConfig' });

export type MproveConfig = z.infer<typeof zMproveConfig>;
