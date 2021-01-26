import { interfaces } from '~/barrels/interfaces';

export function getTestConfig(baseConfig: interfaces.Config) {
  let testConfig = Object.assign({}, baseConfig);

  return testConfig;
}
