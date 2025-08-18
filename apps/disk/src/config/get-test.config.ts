import { Config } from '~disk/interfaces/config';

export function getTestConfig(devConfig: Config) {
  let testConfig = Object.assign({}, devConfig);

  return testConfig;
}
