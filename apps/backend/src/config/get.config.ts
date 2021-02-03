import { api } from '~backend/barrels/api';
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

  let validatedConfig = api.transformValidSync({
    classType: interfaces.Config,
    object: config,
    errorMessage: api.ErEnum.BACKEND_WRONG_ENV_VALUES
  });

  return validatedConfig;
}
