import { BackendConfig } from '~common/interfaces/backend/backend-config';

export function getProdConfig(devConfig: BackendConfig) {
  let prodConfig = Object.assign({}, devConfig);

  // prodConfig.allowTestRoutes = BoolEnum.FALSE;
  // testConfig.backendLogIsJson = BoolEnum.FALSE;

  return prodConfig;
}
