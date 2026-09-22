import { Result } from '@praha/byethrow';
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
import type { MproveConfig } from '#common/zod/backend/mprove-config';
import type { FileProjectConf } from '#common/zod/blockml/internal/file-project-conf';

export function getProjectConfig(item: {
  isUseCache: boolean;
  cachedMproveConfig: MproveConfig;
  yamlProjectConfig?: FileProjectConf;
}): Result.Result<FileProjectConf | undefined, never> {
  let { isUseCache, cachedMproveConfig, yamlProjectConfig } = item;

  if (isUseCache === false) {
    return Result.succeed(yamlProjectConfig);
  }

  let cachedProjectConfig: FileProjectConf = {
    fileName: undefined,
    fileExt: undefined,
    filePath: undefined,
    name: undefined,
    mprove_dir: cachedMproveConfig.mproveDirValue,
    case_sensitive_string_filters:
      cachedMproveConfig.caseSensitiveStringFilters?.toString().toLowerCase() ??
      PROJECT_CONFIG_CASE_SENSITIVE_STRING_FILTERS,
    week_start: cachedMproveConfig.weekStart ?? PROJECT_CONFIG_WEEK_START,
    default_timezone:
      cachedMproveConfig.defaultTimezone ?? PROJECT_CONFIG_DEFAULT_TIMEZONE,
    allow_timezones:
      cachedMproveConfig.allowTimezones?.toString().toLowerCase() ??
      PROJECT_CONFIG_ALLOW_TIMEZONES,
    format_number:
      cachedMproveConfig.formatNumber ?? PROJECT_CONFIG_FORMAT_NUMBER,
    currency_prefix:
      cachedMproveConfig.currencyPrefix ?? PROJECT_CONFIG_CURRENCY_PREFIX,
    currency_suffix:
      cachedMproveConfig.currencySuffix ?? PROJECT_CONFIG_CURRENCY_SUFFIX,
    thousands_separator:
      cachedMproveConfig.thousandsSeparator ??
      PROJECT_CONFIG_THOUSANDS_SEPARATOR
  };

  return Result.succeed(cachedProjectConfig);
}
