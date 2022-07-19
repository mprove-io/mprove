import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';

export function getProdConfig(devConfig: interfaces.Config) {
  let prodConfig = Object.assign({}, devConfig);

  prodConfig.backendLogIsColor = common.BoolEnum.FALSE;
  prodConfig.allowTestRoutes = common.BoolEnum.FALSE;

  return prodConfig;
}
