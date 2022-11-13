import { interfaces } from '~backend/barrels/interfaces';

export function getProdConfig(devConfig: interfaces.Config) {
  let prodConfig = Object.assign({}, devConfig);

  // prodConfig.allowTestRoutes = common.BoolEnum.FALSE;
  // testConfig.backendLogIsStringify = common.BoolEnum.FALSE;

  return prodConfig;
}
