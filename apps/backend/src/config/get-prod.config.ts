import { api } from '~backend/barrels/api';
import { interfaces } from '~backend/barrels/interfaces';

export function getProdConfig(baseConfig: interfaces.Config) {
  let prodConfig = Object.assign({}, baseConfig);

  prodConfig.mproveLogIsColor = api.BoolEnum.FALSE;

  return prodConfig;
}
