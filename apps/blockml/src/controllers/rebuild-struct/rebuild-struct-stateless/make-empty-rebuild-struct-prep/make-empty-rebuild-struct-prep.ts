import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { RebuildStructPrep } from '#blockml/types/rebuild-struct-prep';
import {
  PROJECT_CONFIG_ALLOW_TIMEZONES,
  PROJECT_CONFIG_CASE_SENSITIVE_STRING_FILTERS,
  PROJECT_CONFIG_CURRENCY_PREFIX,
  PROJECT_CONFIG_CURRENCY_SUFFIX,
  PROJECT_CONFIG_DEFAULT_TIMEZONE,
  PROJECT_CONFIG_FORMAT_NUMBER,
  PROJECT_CONFIG_THOUSANDS_SEPARATOR,
  PROJECT_CONFIG_WEEK_START
} from '#common/constants/top';
import { toBooleanFromLowercaseString } from '#common/functions/to-boolean-from-lowercase-string';
import { MproveConfig } from '#common/zod/backend/mprove-config';

export function makeEmptyRebuildStructPrep(item: {
  errors: BmError[];
}): Result.Result<RebuildStructPrep, never> {
  let mproveConfig: MproveConfig = {
    mproveDirValue: undefined,
    weekStart: PROJECT_CONFIG_WEEK_START,
    allowTimezones: toBooleanFromLowercaseString(
      PROJECT_CONFIG_ALLOW_TIMEZONES
    ),
    defaultTimezone: PROJECT_CONFIG_DEFAULT_TIMEZONE,
    currencyPrefix: PROJECT_CONFIG_CURRENCY_PREFIX,
    currencySuffix: PROJECT_CONFIG_CURRENCY_SUFFIX,
    thousandsSeparator: PROJECT_CONFIG_THOUSANDS_SEPARATOR,
    formatNumber: PROJECT_CONFIG_FORMAT_NUMBER,
    caseSensitiveStringFilters: toBooleanFromLowercaseString(
      PROJECT_CONFIG_CASE_SENSITIVE_STRING_FILTERS
    )
  };

  let prep: RebuildStructPrep = {
    errors: item.errors,
    apiModels: [],
    metrics: [],
    presets: [],
    spaces: [],
    stores: [],
    reports: [],
    dashboards: [],
    charts: [],
    extraSchemas: [],
    mproveExplorer: undefined,
    mproveConfig: mproveConfig
  };

  return Result.succeed(prep);
}
