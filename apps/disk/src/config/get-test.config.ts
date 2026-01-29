import { DiskConfig } from '#disk/config/disk-config';

export function getTestConfig(devConfig: DiskConfig) {
  let testConfig = Object.assign({}, devConfig);

  return testConfig;
}
