import { common } from '~disk/barrels/common';
import { nodeCommon } from '~disk/barrels/node-common';
import { DiskEnvEnum } from '~disk/enums/disk-env.enum';
import { Config } from '~disk/interfaces/config';
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

  let validatedConfig = nodeCommon.transformValidSync({
    classType: Config,
    object: config,
    errorMessage: common.ErEnum.DISK_WRONG_ENV_VALUES,
    logIsJson: config.diskLogIsJson,
    logger: undefined
  });

  return validatedConfig;
}
