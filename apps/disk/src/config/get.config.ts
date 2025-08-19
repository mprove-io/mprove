import { ErEnum } from '~common/enums/er.enum';
import { DiskEnvEnum } from '~disk/enums/disk-env.enum';
import { Config } from '~disk/interfaces/config';
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
    classType: Config,
    object: config,
    errorMessage: ErEnum.DISK_WRONG_ENV_VALUES,
    logIsJson: config.diskLogIsJson,
    logger: undefined
  });

  return validatedConfig;
}
