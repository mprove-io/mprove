import { DiskConfig } from '~common/interfaces/disk/disk-config';

export function getTestConfig(devConfig: DiskConfig) {
  let testConfig = Object.assign({}, devConfig);

  return testConfig;
}
