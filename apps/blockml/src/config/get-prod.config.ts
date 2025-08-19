import { BlockmlConfig } from '~common/interfaces/blockml/blockml-config';

export function getProdConfig(devConfig: BlockmlConfig) {
  let prodConfig = Object.assign({}, devConfig);

  return prodConfig;
}
