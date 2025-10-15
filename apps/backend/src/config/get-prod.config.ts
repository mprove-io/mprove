import { BackendConfig } from '~backend/config/backend-config';

export function getProdConfig(devConfig: BackendConfig) {
  let prodConfig = Object.assign({}, devConfig);

  // prodConfig.allowTestRoutes = false;
  // testConfig.backendLogIsJson = false;

  return prodConfig;
}
