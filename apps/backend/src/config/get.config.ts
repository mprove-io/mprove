import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { enums } from '~backend/barrels/enums';
import { interfaces } from '~backend/barrels/interfaces';
import { getDevConfig } from './get-dev.config';
import { getProdConfig } from './get-prod.config';
import { getTestConfig } from './get-test.config';

export function getConfig() {
  let envFilePath = process.env.ENV_FILE_PATH;
  let devConfig = getDevConfig(envFilePath);

  let config =
    devConfig.backendEnv === enums.BackendEnvEnum.PROD
      ? getProdConfig(devConfig)
      : devConfig.backendEnv === enums.BackendEnvEnum.TEST
      ? getTestConfig(devConfig)
      : devConfig;

  let validatedConfig = common.transformValidSync({
    classType: interfaces.Config,
    object: config,
    errorMessage: apiToBackend.ErEnum.BACKEND_WRONG_ENV_VALUES
  });

  // console.log(`validatedConfig.isScheduler=${validatedConfig.isScheduler}`);

  return validatedConfig;
}
