import { DiskConfig } from '~common/interfaces/disk/disk-config';

export function getProdConfig(devConfig: DiskConfig) {
  let prodConfig = Object.assign({}, devConfig);

  return prodConfig;
}
