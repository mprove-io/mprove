import { Result } from '@praha/byethrow';
import { ServerError } from '#common/classes/server-error/server-error';
import { getConfig } from '#mcli/config/get-config';
import type { McliConfig } from '#mcli/config/mcli-config';
import type { GetConfigError } from '#mcli/types/function-errors/get-config-error';

export function getConfigUnwrap(envPath?: string): McliConfig {
  let result: Result.Result<McliConfig, GetConfigError> = getConfig({
    envPath: envPath
  });

  if (Result.isFailure(result)) {
    throw new ServerError({
      message: result.error.code,
      displayData: result.error.displayData
    });
  }

  let config: McliConfig = result.value;

  return config;
}
