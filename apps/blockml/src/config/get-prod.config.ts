import { interfaces } from '~blockml/barrels/interfaces';

export function getProdConfig(baseConfig: interfaces.Config) {
  let prodConfig = Object.assign({}, baseConfig);

  return prodConfig;
}
