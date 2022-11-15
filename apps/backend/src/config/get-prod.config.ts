import { interfaces } from '~backend/barrels/interfaces';

export function getProdConfig(devConfig: interfaces.Config) {
  let prodConfig = Object.assign({}, devConfig);

  // prodConfig.allowTestRoutes = common.BoolEnum.FALSE;
  // testConfig.backendLogIsJson = common.BoolEnum.FALSE;

  return prodConfig;
}
