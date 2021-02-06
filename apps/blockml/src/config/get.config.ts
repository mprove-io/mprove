import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { common } from '~blockml/barrels/common';
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

  let validatedConfig = common.transformValidSync({
    classType: interfaces.Config,
    object: config,
    errorMessage: apiToBlockml.ErEnum.BLOCKML_WRONG_ENV_VALUES
  });

  return validatedConfig;
}
