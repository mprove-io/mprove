import { api } from '~backend/barrels/api';
import { enums } from '~backend/barrels/enums';
import { interfaces } from '~backend/barrels/interfaces';
import { getBaseConfig } from './get-base.config';
import { getProdConfig } from './get-prod.config';
import { getTestConfig } from './get-test.config';

export function getConfig() {
  let envFilePath = process.env.ENV_FILE_PATH;
  let baseConfig = getBaseConfig(envFilePath);

  let config =
    baseConfig.backendEnv === enums.BackendEnvEnum.PROD
      ? getProdConfig(baseConfig)
      : baseConfig.backendEnv === enums.BackendEnvEnum.TEST
      ? getTestConfig(baseConfig)
      : baseConfig;

  let validatedConfig = api.transformValidSync({
    classType: interfaces.Config,
    object: config,
    errorMessage: api.ErEnum.M_BACKEND_WRONG_ENV_VALUES
  });

  return validatedConfig;
}
