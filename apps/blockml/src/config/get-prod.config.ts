import { interfaces } from '~blockml/barrels/interfaces';

export function getProdConfig(devConfig: interfaces.Config) {
  let prodConfig = Object.assign({}, devConfig);

  return prodConfig;
}
