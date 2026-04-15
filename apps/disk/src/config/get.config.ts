import { DiskEnvEnum } from '#common/enums/env/disk-env.enum';
import { ErEnum } from '#common/enums/er.enum';
import { zDiskConfig } from '#disk/config/disk-config';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';
import { getDevConfig } from './get-dev.config';
import { getProdConfig } from './get-prod.config';
import { getTestConfig } from './get-test.config';

export function getConfig() {
  let devConfig = getDevConfig();

  let config =
    devConfig.diskEnv === DiskEnvEnum.PROD
      ? getProdConfig(devConfig)
      : devConfig.diskEnv === DiskEnvEnum.TEST
        ? getTestConfig(devConfig)
        : devConfig;

  let validatedConfig = zodParseOrThrow({
    schema: zDiskConfig,
    object: config,
    errorMessage: ErEnum.DISK_WRONG_ENV_VALUES,
    logIsJson: config.diskLogIsJson,
    logger: undefined
  });

  return validatedConfig;
}
