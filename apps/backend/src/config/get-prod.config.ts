import { BackendConfig } from '~backend/config/backend-config';

export function getProdConfig(devConfig: BackendConfig) {
  let prodConfig = Object.assign({}, devConfig);

  // prodConfig.allowTestRoutes = BoolEnum.FALSE;
  // testConfig.backendLogIsJson = BoolEnum.FALSE;

  return prodConfig;
}
