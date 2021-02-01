import { api } from '~backend/barrels/api';
import { interfaces } from '~backend/barrels/interfaces';

export function getTestConfig(baseConfig: interfaces.Config) {
  let testConfig = Object.assign({}, baseConfig);

  testConfig.mproveLogIsColor = api.BoolEnum.FALSE;

  return testConfig;
}
