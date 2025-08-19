import { DiskEnvEnum } from '~common/enums/env/disk-env.enum';
import { ErEnum } from '~common/enums/er.enum';
import { DiskConfig } from '~common/interfaces/disk/disk-config';
import { transformValidSync } from '~node-common/functions/transform-valid-sync';
import { getDevConfig } from './get-dev.config';
import { getProdConfig } from './get-prod.config';
import { getTestConfig } from './get-test.config';

export function getConfig() {
  let envFilePath = process.env.ENV_FILE_PATH;
  let devConfig = getDevConfig(envFilePath);

  let config =
    devConfig.diskEnv === DiskEnvEnum.PROD
      ? getProdConfig(devConfig)
      : devConfig.diskEnv === DiskEnvEnum.TEST
        ? getTestConfig(devConfig)
        : devConfig;

  let validatedConfig = transformValidSync({
    classType: DiskConfig,
    object: config,
    errorMessage: ErEnum.DISK_WRONG_ENV_VALUES,
    logIsJson: config.diskLogIsJson,
    logger: undefined
  });

  return validatedConfig;
}
