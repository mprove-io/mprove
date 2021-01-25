import { interfaces } from '~/barrels/interfaces';
import { api } from '~/barrels/api';

export function getTestConfig(baseConfig: interfaces.Config) {
  let testConfig = Object.assign({}, baseConfig);

  return testConfig;
}
