import { zBackendConfig } from '#backend/config/backend-config';
import { BackendEnvEnum } from '#common/enums/env/backend-env.enum';
import { ErEnum } from '#common/enums/er.enum';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';
import { getDevConfig } from './get-dev.config';
import { getProdConfig } from './get-prod.config';
import { getTestConfig } from './get-test.config';

export function getConfig() {
  let devConfig = getDevConfig();

  let config =
    devConfig.backendEnv === BackendEnvEnum.PROD
      ? getProdConfig(devConfig)
      : devConfig.backendEnv === BackendEnvEnum.TEST
        ? getTestConfig(devConfig)
        : devConfig;

  let validatedConfig = zodParseOrThrow({
    schema: zBackendConfig,
    object: config,
    errorMessage: ErEnum.BACKEND_WRONG_ENV_VALUES,
    logIsJson: config.backendLogIsJson,
    logger: undefined
  });

  return validatedConfig;
}
