import { zDiskConfig } from '#disk/config/disk-config';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw/zod-parse-or-throw';
import { getDevConfig } from './get-dev.config';
import { getProdConfig } from './get-prod.config';
import { getTestConfig } from './get-test.config';

export function getConfig() {
  let devConfig = getDevConfig();

  let config =
    devConfig.diskEnv === 'PROD'
      ? getProdConfig(devConfig)
      : devConfig.diskEnv === 'TEST'
        ? getTestConfig(devConfig)
        : devConfig;

  let validatedConfig = zodParseOrThrow({
    schema: zDiskConfig,
    object: config,
    errorMessage: 'DISK_WRONG_ENV_VALUES',
    logIsJson: config.diskLogIsJson,
    logger: undefined
  });

  return validatedConfig;
}
