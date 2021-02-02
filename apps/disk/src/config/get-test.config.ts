import { interfaces } from '~disk/barrels/interfaces';

export function getTestConfig(devConfig: interfaces.Config) {
  let testConfig = Object.assign({}, devConfig);

  return testConfig;
}
