import { api } from '../barrels/api';
import { interfaces } from '../barrels/interfaces';
import { enums } from '../barrels/enums';
import { getBaseConfig } from './get-base.config';
import { getProdConfig } from './get-prod.config';
import { getTestConfig } from './get-test.config';

export function getConfig() {
  let envFilePath = process.env.ENV_FILE_PATH;
  let baseConfig = getBaseConfig(envFilePath);

  let config =
    baseConfig.blockmlEnv === enums.BlockmlEnvEnum.PROD
      ? getProdConfig(baseConfig)
      : baseConfig.blockmlEnv === enums.BlockmlEnvEnum.TEST
      ? getTestConfig(baseConfig)
      : baseConfig;

  let validatedConfig = api.transformValidSync({
    classType: interfaces.Config,
    object: config,
    errorMessage: api.ErEnum.M_BLOCKML_WRONG_ENV_VALUES
  });

  return validatedConfig;
}
