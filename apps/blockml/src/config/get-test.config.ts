import { interfaces } from '~blockml/barrels/interfaces';

export function getTestConfig(devConfig: interfaces.Config) {
  let testConfig = Object.assign({}, devConfig);

  return testConfig;
}
