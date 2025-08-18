import { Config } from '~disk/interfaces/config';

export function getProdConfig(devConfig: Config) {
  let prodConfig = Object.assign({}, devConfig);

  return prodConfig;
}
