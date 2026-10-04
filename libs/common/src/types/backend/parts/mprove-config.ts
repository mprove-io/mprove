import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ProjectWeekStart,
  zProjectWeekStart
} from '#common/types/backend/parts/project/project-week-start';

import {
  type TimezoneString,
  zTimezone
} from '#common/types/shared/timezone/z-timezone';

export type MproveConfig = {
  mproveDirValue?: string;
  caseSensitiveStringFilters?: boolean;
  weekStart?: ProjectWeekStart;
  allowTimezones?: boolean;
  defaultTimezone?: TimezoneString;
  formatNumber?: string;
  currencyPrefix?: string;
  currencySuffix?: string;
  thousandsSeparator?: string;
};

export let zMproveConfig = z
  .object({
    mproveDirValue: z.string().nullish(),
    caseSensitiveStringFilters: z.boolean().nullish(),
    weekStart: zProjectWeekStart.nullish(),
    allowTimezones: z.boolean().nullish(),
    defaultTimezone: zTimezone.nullish(),
    formatNumber: z.string().nullish(),
    currencyPrefix: z.string().nullish(),
    currencySuffix: z.string().nullish(),
    thousandsSeparator: z.string().nullish()
  })
  .meta({ id: 'MproveConfig' });

assertTypesEqual<MproveConfig, z.infer<typeof zMproveConfig>>({ value: true });
