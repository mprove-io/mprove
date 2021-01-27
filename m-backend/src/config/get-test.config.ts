import { api } from '~/barrels/api';
import { interfaces } from '~/barrels/interfaces';

export function getTestConfig(baseConfig: interfaces.Config) {
  let testConfig = Object.assign({}, baseConfig);

  testConfig.mproveLogIsColor = api.BoolEnum.FALSE;

  return testConfig;
}
