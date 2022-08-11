import { interfaces } from '~backend/barrels/interfaces';

export function getProdConfig(devConfig: interfaces.Config) {
  let prodConfig = Object.assign({}, devConfig);

  // testConfig.backendLogIsColor = common.BoolEnum.FALSE;

  return prodConfig;
}
