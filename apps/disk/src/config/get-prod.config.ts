import { DiskConfig } from '~disk/config/disk-config';

export function getProdConfig(devConfig: DiskConfig) {
  let prodConfig = Object.assign({}, devConfig);

  return prodConfig;
}
