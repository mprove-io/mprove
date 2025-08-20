import { BackendConfig } from '~backend/config/backend-config';

export function getTestConfig(devConfig: BackendConfig) {
  let testConfig = Object.assign({}, devConfig);

  // testConfig.backendLogIsJson = BoolEnum.FALSE;

  return testConfig;
}
