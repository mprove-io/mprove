import { common } from '~disk/barrels/common';
import { enums } from '~disk/barrels/enums';
import { interfaces } from '~disk/barrels/interfaces';
import { nodeCommon } from '~disk/barrels/node-common';
import { getDevConfig } from './get-dev.config';
import { getProdConfig } from './get-prod.config';
import { getTestConfig } from './get-test.config';

export function getConfig() {
  let envFilePath = process.env.ENV_FILE_PATH;
  let devConfig = getDevConfig(envFilePath);

  let config =
    devConfig.diskEnv === enums.DiskEnvEnum.PROD
      ? getProdConfig(devConfig)
      : devConfig.diskEnv === enums.DiskEnvEnum.TEST
      ? getTestConfig(devConfig)
      : devConfig;

  let validatedConfig = nodeCommon.transformValidSync({
    classType: interfaces.Config,
    object: config,
    errorMessage: common.ErEnum.DISK_WRONG_ENV_VALUES,
    logIsJson: config.diskLogIsJson,
    logger: undefined
  });

  return validatedConfig;
}
