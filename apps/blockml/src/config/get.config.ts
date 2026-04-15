import { zBlockmlConfig } from '#blockml/config/blockml-config';
import { BlockmlEnvEnum } from '#common/enums/env/blockml-env.enum';
import { ErEnum } from '#common/enums/er.enum';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';
import { getDevConfig } from './get-dev.config';
import { getProdConfig } from './get-prod.config';
import { getTestConfig } from './get-test.config';

export function getConfig() {
  let devConfig = getDevConfig();

  let config =
    devConfig.blockmlEnv === BlockmlEnvEnum.PROD
      ? getProdConfig(devConfig)
      : devConfig.blockmlEnv === BlockmlEnvEnum.TEST
        ? getTestConfig(devConfig)
        : devConfig;

  let validatedConfig = zodParseOrThrow({
    schema: zBlockmlConfig,
    object: config,
    errorMessage: ErEnum.BLOCKML_WRONG_ENV_VALUES,
    logIsJson: config.blockmlLogIsJson,
    logger: undefined
  });

  return validatedConfig;
}
