import { BackendConfig } from '~common/interfaces/backend/backend-config';

export function getTestConfig(devConfig: BackendConfig) {
  let testConfig = Object.assign({}, devConfig);

  // testConfig.backendLogIsJson = BoolEnum.FALSE;

  return testConfig;
}
