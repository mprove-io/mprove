import { enums } from '../barrels/enums';
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

  return config;
}
