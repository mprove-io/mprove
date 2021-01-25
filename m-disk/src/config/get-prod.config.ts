import { interfaces } from '~/barrels/interfaces';
import { api } from '~/barrels/api';

export function getProdConfig(baseConfig: interfaces.Config) {
  let prodConfig = Object.assign({}, baseConfig);

  return prodConfig;
}
