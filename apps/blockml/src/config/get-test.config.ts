import { interfaces } from '~blockml/barrels/interfaces';

export function getTestConfig(baseConfig: interfaces.Config) {
  let testConfig = Object.assign({}, baseConfig);

  return testConfig;
}
