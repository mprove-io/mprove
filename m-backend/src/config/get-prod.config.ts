import { api } from '~/barrels/api';
import { interfaces } from '~/barrels/interfaces';

export function getProdConfig(baseConfig: interfaces.Config) {
  let prodConfig = Object.assign({}, baseConfig);

  prodConfig.mproveLogIsColor = api.BoolEnum.FALSE;

  return prodConfig;
}
