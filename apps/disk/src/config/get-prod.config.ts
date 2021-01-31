import { interfaces } from '~/barrels/interfaces';

export function getProdConfig(baseConfig: interfaces.Config) {
  let prodConfig = Object.assign({}, baseConfig);

  return prodConfig;
}
