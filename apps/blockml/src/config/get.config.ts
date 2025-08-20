import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BlockmlEnvEnum } from '~common/enums/env/blockml-env.enum';
import { ErEnum } from '~common/enums/er.enum';
import { transformValidSync } from '~node-common/functions/transform-valid-sync';
import { getDevConfig } from './get-dev.config';
import { getProdConfig } from './get-prod.config';
import { getTestConfig } from './get-test.config';

export function getConfig() {
  let envFilePath = process.env.ENV_FILE_PATH;
  let devConfig = getDevConfig(envFilePath);

  let config =
    devConfig.blockmlEnv === BlockmlEnvEnum.PROD
      ? getProdConfig(devConfig)
      : devConfig.blockmlEnv === BlockmlEnvEnum.TEST
        ? getTestConfig(devConfig)
        : devConfig;

  let validatedConfig = transformValidSync({
    classType: BlockmlConfig,
    object: config,
    errorMessage: ErEnum.BLOCKML_WRONG_ENV_VALUES,
    logIsJson: config.blockmlLogIsJson,
    logger: undefined
  });

  return validatedConfig;
}
