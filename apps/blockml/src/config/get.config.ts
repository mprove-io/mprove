import { api } from '~blockml/barrels/api';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';
import { getDevConfig } from './get-dev.config';
import { getProdConfig } from './get-prod.config';
import { getTestConfig } from './get-test.config';

export function getConfig() {
  let envFilePath = process.env.ENV_FILE_PATH;
  let devConfig = getDevConfig(envFilePath);

  let config =
    devConfig.blockmlEnv === enums.BlockmlEnvEnum.PROD
      ? getProdConfig(devConfig)
      : devConfig.blockmlEnv === enums.BlockmlEnvEnum.TEST
      ? getTestConfig(devConfig)
      : devConfig;

  let validatedConfig = api.transformValidSync({
    classType: interfaces.Config,
    object: config,
    errorMessage: api.ErEnum.M_BLOCKML_WRONG_ENV_VALUES
  });

  return validatedConfig;
}
