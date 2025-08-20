import { BlockmlConfig } from '~blockml/config/blockml-config';

export function getProdConfig(devConfig: BlockmlConfig) {
  let prodConfig = Object.assign({}, devConfig);

  return prodConfig;
}
