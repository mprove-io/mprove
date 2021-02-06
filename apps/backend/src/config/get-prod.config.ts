import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';

export function getProdConfig(devConfig: interfaces.Config) {
  let prodConfig = Object.assign({}, devConfig);

  prodConfig.mproveLogIsColor = common.BoolEnum.FALSE;

  return prodConfig;
}
