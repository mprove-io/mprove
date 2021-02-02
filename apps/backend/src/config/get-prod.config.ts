import { api } from '~backend/barrels/api';
import { interfaces } from '~backend/barrels/interfaces';

export function getProdConfig(devConfig: interfaces.Config) {
  let prodConfig = Object.assign({}, devConfig);

  prodConfig.mproveLogIsColor = api.BoolEnum.FALSE;

  return prodConfig;
}
